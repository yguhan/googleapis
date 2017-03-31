  var _replaceAllTextFactory = function(text, replaceText){
    return _replaceAllText =  {
      "replaceAllText": {
        "containsText": {
          "text": text,
          "matchCase": ""
        },
        "replaceText": replaceText
      }
    }
  };

  console.log(_replaceAllTextFactory("hello", "world"));