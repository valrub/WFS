function main(re, ie, oe, executor) {
    setGlobalLogger(re, ie, oe, executor,4);
      try {
          var validUrl = re.placeholder18;
          var likersCount = 100;
          Logger.production( 'Instagram_Search_post_Collect_Likers Current Urls is ' + validUrl);
          re.downloadVideoFiles = true;
  
          makeVMFRequest(re, ie, oe, executor)({
            input: {
              platform: "instagram",
              task: "likers",
              postId: re.placeholder20,
              likersCount: likersCount
            },
            targets: [validUrl]
          });
      } catch (e) {
          Logger.error("Likers not collected");
          Logger.error("Instagram_Search_post_Collect_Likers: " + JSON.stringify(e));
          finalize();
      }
  }