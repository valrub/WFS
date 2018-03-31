function LinkedIn() {
	this.state = "static";
}
LinkedIn.prototype.login = function (m) {
	logger.debug("logging in to linkedin")
	let agentName = m.input.agentname;
	let agentPass = m.input.agentpass;
	//---------------------------------------------------------
	let _self = this;
	_self.update("running");
	nightmare
		.goto('https://www.linkedin.com/uas/login')
		.evaluate(function () {
			document.querySelector('#session_key-login').value = '';

		})
		.type('#session_key-login', agentName)
		.type('#session_password-login', agentPass)
		.click('#btn-primary')
		.wait(5000)
		.run(function (err, result) {
			if (err) {
				return logger.error("[" + process.pid + "] Nightmare Linkedin Login Error: " + err);
			} else {
				_self.update("active");

				process.send({
					"type": "finished"
				});

				commonLib.closeService();
			}
		})
		.end();
};

var scrapePeople = function (count, correlationId) {

	return new Promise((resolve, reject) => {
		scrollDown(collectPeople, ".//figure[contains(@class, 'search-result__image')]/img[contains(@class, 'loaded')]", count, null);
		//scrollDown(collectTopics, ".//li[contains(@class, 'search-result search-result__occluded-item ember-view')]", count, null)
		function scrollDown(callback, xpath, max, parameters) {
			try {
				var loadedElements = 0;
				var loadTime = 0;
				var maxLoadTime = 10000;
				var currentXpath = "";
				var scrollInterval = setInterval(function () {
					currentXpath = document.evaluate(xpath, document, null, 7, null);
					if (currentXpath.snapshotLength < max) {
						window.scrollBy(0, 50);
						if (loadedElements == currentXpath.snapshotLength) {
							loadTime += 500;
							if (loadTime >= maxLoadTime) {
								clearInterval(scrollInterval);
								callback.apply(this, parameters);
							}
						} else {
							loadedElements = currentXpath.snapshotLength;
							loadTime = 0;
						}
					} else {
						clearInterval(scrollInterval);
						callback.apply(this, parameters);
					}
				}, 500);
			} catch (e) {
				reject(e)
			}
		}

		function collectPeople() {

			try {
				let results = [];
				let pplCollection = document.evaluate(".//div[contains(@class, 'search-result__wrapper')]", document, null, 5, null);
				let thisPerson = pplCollection.iterateNext();
				while (thisPerson) {
					let person = {};
					try {
						person.name = document.evaluate(".//span[contains(@class, 'actor-name')]", thisPerson, null, 9, null).singleNodeValue.textContent.trim();
					} catch (err) {
						person.name = "";
					}
					try {
						person.avatar = document.evaluate(".//figure[contains(@class, 'search-result__image')]/img", thisPerson, null, 9, null).singleNodeValue.getAttribute('src');
					} catch (err) {
						person.avatar = "";
					}
					try {
						person.info = document.evaluate(".//p[contains(@class, 'search-result__truncate') and contains(@class, 'subline-level-1')]", thisPerson, null, 9, null).singleNodeValue.textContent.trim();
					} catch (err) {
						person.info = "";
					}
					try {
						person.location = document.evaluate(".//p[contains(@class, 'search-result__truncate') and contains(@class, 'subline-level-2')]", thisPerson, null, 9, null).singleNodeValue.textContent.trim();
					} catch (err) {
						person.location = "";
					}
					try {
						person.url = "https://www.linkedin.com" + document.evaluate(".//a[contains(@class, 'search-result__result-link')]", thisPerson, null, 9, null).singleNodeValue.getAttribute('href');
					} catch (err) {
						person.url = "";
					}
					results.push(person)
					thisPerson = pplCollection.iterateNext();
				}
				resolve(results);
			} catch (e) {
				reject(e)
			}
		}
	});
}

LinkedIn.prototype.searchPeople = function (m) {
	console.log("search")
	console.log(JSON.stringify(m))
	var targetUrl = m.target;
	var count = m.input.count;
	var correlationId = m.input.taskId;
	let _self = this;
	_self.update("running");
	logger.debug("[" + process.pid + "] Searching: " + targetUrl);

	nightmare
		.goto(targetUrl)
		.wait(5000)
		.evaluate(scrapePeople, count, correlationId)
		.run(function (err, results) {

			if (err) {
				logger.error("[" + process.pid + "] Nightmare Linkedin Search Error: " + err.message);
				process.send({
					"type": "finished"
				})
				_self.update("active");
			};
			if (results && results.length > 0) {
				results.forEach(person => {
					if (person.name) {
						process.send({
							"type": "entity",
							"body": {
								"activityType": "1",
								"itemType": "4",
								"type": "1",
								"externalId": person.url,
								"url": person.url,
								"title": person.name,
								"description": person.info,
								//"imageUrl": (person.avatar.indexOf("data:image") == -1) ? person.avatar : ""
								"imageUrl": person.avatar
							}
						});
						process.send({
							"type": "entity",
							"body": {
								"itemType": "15",
								"type": "4",
								"externalId": "address-" + person.url,
								"parentObjectType": "4",
								"parent_externalId": person.url,
								"writer_externalId": person.url,
								"body": person.location,
								"gender": "P"
							}
						});
					}
				});
			}

			_self.update("active");
			process.send({
				"type": "finished"
			})
		})
};

LinkedIn.prototype.company = function (m) {
	var targetUrl = m.target;
	let _self = this;
	_self.update("running");
	logger.debug("[" + process.pid + "] Target Company: " + targetUrl);
	nightmare
		.goto(targetUrl)
		.wait(5000)
		.evaluate(function () {
			try {

				if (document.evaluate(".//div[contains(@class, 'profile-view-grid')]", document, null, 9, null).singleNodeValue) {
					return {
						target: "profile",
						avatar: document.evaluate(".//div[contains(@class, 'top-card-section__header')]//img", document, null, 9, null).singleNodeValue ? document.evaluate(".//div[contains(@class, 'top-card-section__header')]//img", document, null, 9, null).singleNodeValue.getAttribute('src') : "",
						name: document.evaluate(".//div[contains(@class, 'top-card-section__information')]//h1", document, null, 9, null).singleNodeValue ? document.evaluate(".//div[contains(@class, 'top-card-section__information')]//h1", document, null, 9, null).singleNodeValue.textContent : "",
						position: document.evaluate(".//div[contains(@class, 'top-card-section__information')]//h2", document, null, 9, null).singleNodeValue ? document.evaluate(".//div[contains(@class, 'top-card-section__information')]//h2", document, null, 9, null).singleNodeValue.textContent : "",
						info: document.evaluate(".//p[contains(@class, 'top-card-section__summary')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//p[contains(@class, 'top-card-section__summary')]", document, null, 9, null).singleNodeValue.textContent.trim() : "",
						work: document.evaluate(".//h3[contains(@class, 'top-card-section__company')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//h3[contains(@class, 'top-card-section__company')]", document, null, 9, null).singleNodeValue.textContent.trim() : "",
						education: document.evaluate(".//h3[contains(@class, 'top-card-section__school')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//h3[contains(@class, 'top-card-section__school')]", document, null, 9, null).singleNodeValue.textContent.trim() : "",
						location: document.evaluate(".//h3[contains(@class, 'top-card-section__location')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//h3[contains(@class, 'top-card-section__location')]", document, null, 9, null).singleNodeValue.textContent.trim() : "",
						followers: document.evaluate(".//h3[contains(@class, 'top-card-section__connections')]//span", document, null, 9, null).singleNodeValue ? document.evaluate(".//h3[contains(@class, 'top-card-section__connections')]//span", document, null, 9, null).singleNodeValue.textContent.trim() : ""
					}
				} else if (document.evaluate(".//section[contains(@class, 'school-top-card-module')]", document, null, 9, null).singleNodeValue) {
					return {
						target: "school",
						name: document.evaluate(".//h1[contains(@class, 'org-top-card-module__name')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//h1[contains(@class, 'org-top-card-module__name')]", document, null, 9, null).singleNodeValue.textContent.trim() : "",
						avatar: document.evaluate(".//img[contains(@class, 'org-top-card-module__logo')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//img[contains(@class, 'org-top-card-module__logo')]", document, null, 9, null).singleNodeValue.getAttribute('src') : "",
						info: document.evaluate(".//p[contains(@class, 'about-us-organization-description')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//p[contains(@class, 'about-us-organization-description')]", document, null, 9, null).singleNodeValue.textContent.trim() : "",
						followers: document.evaluate(".//p[contains(@class, 'followers-count')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//p[contains(@class, 'followers-count')]", document, null, 9, null).singleNodeValue.textContent.match(/[\d+,]+/g)[0].replace(/,/g, '') : "",
						alumni: document.evaluate(".//span[contains(@class, 'school-alumni')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//span[contains(@class, 'school-alumni')]", document, null, 9, null).singleNodeValue.textContent.match(/[\d+,]+/g)[0].replace(/,/g, '') : "",
						location: document.evaluate(".//dd[contains(@class, 'org-about-company-module__headquarter')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//dd[contains(@class, 'org-about-company-module__headquarter')]", document, null, 9, null).singleNodeValue.textContent.trim() : "",
						founded: document.evaluate(".//dd[contains(@class, 'about-company-module__founded-year')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//dd[contains(@class, 'about-company-module__founded-year')]", document, null, 9, null).singleNodeValue.textContent.trim() : ""
					}
				} else {
					return {
						target: "company",
						name: document.evaluate(".//h1[contains(@class, 'org-top-card-module__name')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//h1[contains(@class, 'org-top-card-module__name')]", document, null, 9, null).singleNodeValue.textContent.trim() : "",
						avatar: document.evaluate(".//img[contains(@class, 'org-top-card-module__logo')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//img[contains(@class, 'org-top-card-module__logo')]", document, null, 9, null).singleNodeValue.getAttribute('src') : "",
						info: document.evaluate(".//p[contains(@class, 'about-us-organization-description')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//p[contains(@class, 'about-us-organization-description')]", document, null, 9, null).singleNodeValue.textContent.trim() : "",
						followers: document.evaluate(".//p[contains(@class, 'followers-count')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//p[contains(@class, 'followers-count')]", document, null, 9, null).singleNodeValue.textContent.match(/[\d+,]+/g)[0].replace(/,/g, '') : "",
						employees: document.evaluate(".//span[contains(@class, 'company-size')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//span[contains(@class, 'company-size')]", document, null, 9, null).singleNodeValue.textContent.match(/[\d+,]+/g)[0].replace(/,/g, '') : "",
						location: document.evaluate(".//span[contains(@class, 'org-top-card-module__location')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//span[contains(@class, 'org-top-card-module__location')]", document, null, 9, null).singleNodeValue.textContent.trim() : "",
						founded: document.evaluate(".//dd[contains(@class, 'about-company-module__founded-year')]", document, null, 9, null).singleNodeValue ? document.evaluate(".//dd[contains(@class, 'about-company-module__founded-year')]", document, null, 9, null).singleNodeValue.textContent.trim() : ""
					}
				}
			} catch (e) {

				console.error("Error in company collection: " + e.message);
			}
		})
		.run(function (err, data) {
			if (err) {
				logger.error("[" + process.pid + "] Nightmare Linkedin Company Error: " + JSON.stringify(err));
				process.send({
					"type": "finished"
				})
				_self.update("active");
				return;
			};
			if (data.target == "profile") {
				let profileID = targetUrl;
				process.send({
					"type": "entity",
					"body": {
						"activityType": "1",
						"itemType": "4",
						"type": "1",
						"externalId": profileID,
						"url": targetUrl,
						"title": data.name,
						"body": data.position,
						"description": data.info,
						"imageUrl": data.avatar
					}
				});
				process.send({
					"type": "entity",
					"body": {
						"itemType": "24",
						"parent_externalId": profileID,
						"parentObjectType": "4",
						"activityType": "1",
						"title": "FOLLOWERS",
						"body": data.followers,
						"description": "followers_count"
					}
				});
				process.send({
					"type": "entity",
					"body": {
						"itemType": "15",
						"type": "4",
						"externalId": "address-" + profileID,
						"parentObjectType": "4",
						"parent_externalId": profileID,
						"writer_externalId": profileID,
						"body": data.location,
						"gender": "P"
					}
				});
			} else if (data.target == "school") {
				let companyID = targetUrl;
				process.send({
					"type": "entity",
					"body": {
						"activityType": "1",
						"itemType": "4",
						"type": "6",
						"externalId": companyID,
						"url": targetUrl,
						"title": data.name,
						"description": data.info,
						"imageUrl": data.avatar
					}
				});
				process.send({
					"type": "entity",
					"body": {
						"itemType": "17",
						"type": "2",
						"externalId": "founded-" + companyID,
						"parent_externalId": companyID,
						"parentObjectType": "4",
						"body": data.founded
					}
				});
				process.send({
					"type": "entity",
					"body": {
						"itemType": "15",
						"type": "4",
						"externalId": "address-" + companyID,
						"parentObjectType": "4",
						"parent_externalId": companyID,
						"writer_externalId": companyID,
						"body": data.location,
						"gender": "P"
					}
				});
				process.send({
					"type": "entity",
					"body": {
						"itemType": "24",
						"parent_externalId": companyID,
						"parentObjectType": "4",
						"activityType": "1",
						"title": "MEMBERS",
						"body": data.alumni,
						"description": "members_count"
					}
				});
				process.send({
					"type": "entity",
					"body": {
						"itemType": "24",
						"parent_externalId": companyID,
						"parentObjectType": "4",
						"activityType": "1",
						"title": "FOLLOWERS",
						"body": data.followers,
						"description": "followers_count"
					}
				});
			} else {
				let companyID = targetUrl;
				process.send({
					"type": "entity",
					"body": {
						"activityType": "1",
						"itemType": "4",
						"type": "4",
						"externalId": companyID,
						"url": targetUrl,
						"title": data.name,
						"description": data.info,
						"imageUrl": data.avatar
					}
				});
				process.send({
					"type": "entity",
					"body": {
						"itemType": "17",
						"type": "2",
						"externalId": "founded-" + companyID,
						"parent_externalId": companyID,
						"parentObjectType": "4",
						"body": data.founded
					}
				});
				process.send({
					"type": "entity",
					"body": {
						"itemType": "15",
						"type": "4",
						"externalId": "address-" + companyID,
						"parentObjectType": "4",
						"parent_externalId": companyID,
						"writer_externalId": companyID,
						"body": data.location,
						"gender": "P"
					}
				});
				process.send({
					"type": "entity",
					"body": {
						"itemType": "24",
						"parent_externalId": companyID,
						"parentObjectType": "4",
						"activityType": "1",
						"title": "MEMBERS",
						"body": data.employees,
						"description": "members_count"
					}
				});
				process.send({
					"type": "entity",
					"body": {
						"itemType": "24",
						"parent_externalId": companyID,
						"parentObjectType": "4",
						"activityType": "1",
						"title": "FOLLOWERS",
						"body": data.followers,
						"description": "followers_count"
					}
				});
			}

			process.send({
				"type": "finished"
			})
			_self.update("active");
		})
};

LinkedIn.prototype.update = function (state) {
	let _self = this;
	if (state) {
		_self.state = state;
	}
	process.send({
		"type": "update",
		"state": _self.state
	});

};

module.exports = LinkedIn;