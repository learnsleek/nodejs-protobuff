var service = require(process.cwd() + '/src/service/service.js');
 
exports.controller = async function(colors) {
    return  await service.service();
}