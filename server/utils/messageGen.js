const moment = require('moment');

var messageGen=(from, text)=>{
  return({
    from,
    text,
    createdAt: moment().valueOf()
  });
};

module.exports={messageGen};
