'use strict';

const rp = require('request-promise');

function acquireAccessTokenBySPN(tenantId, clientId, pwd) {
    let payload = `resource=https://management.core.windows.net/&client_id=${clientId}&grant_type=client_credentials&client_secret=${pwd}`;
    let adress = `https://login.windows.net/${tenantId}/oauth2/token`;
    
    let options = {
        method: 'POST',
        uri: adress,
        body: payload,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        json: true 
    };
    
    return rp(options)
        .then(function (parsedBody) {
            return parsedBody.access_token;
        });
}

function getFunctionSecret(sub, rg, functionapp, funcname, token) {
    let adress = `https://management.azure.com/subscriptions/${sub}/resourceGroups/${rg}/providers/Microsoft.Web/sites/${functionapp}/functions/${funcname}/listsecrets?api-version=2015-08-01`;
    let options = {
        method: 'POST',
        uri: adress,
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization": "Bearer " + token },
        json: true
    };
    
    return rp(options)
        .then((data) => {
            // data.key, data.trigger_url
           return data;   
        });
}

exports.acquireAccessTokenBySPN = acquireAccessTokenBySPN;
exports.getFunctionSecret = getFunctionSecret;