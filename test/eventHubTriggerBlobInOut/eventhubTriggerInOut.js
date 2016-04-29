module.exports = function (context, myEventHubMessage, inputBlob) {
    context.log('Node.js eventhub trigger function processed work item', myEventHubMessage);
    /*
    context.log(JSON.stringify(context));
    context.log("***************");
    */
    context.log(JSON.stringify(inputBlob));
    
    context.bindings.outputBlob = myEventHubMessage;

    context.done();
};