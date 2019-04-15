var data = require('../private/config.json');
var path = require('path');
var rp = require('request-promise');
var BASE_URL = 'https://openapi.responsecrm.com/api/v2/open';
var API_GUID = data.funnel.responseKey;

function dynamicRoutes(req, res, next) {
    if (req.url.indexOf('/api') === 0) return next();

    if (data.routes[req.url] && data.routes[req.url].template) {
        var templatePath = path.join('templates', data.routes[req.url].template);
        var renderData = {
            containers: resolveContainers(req.url),
            funnel: parseFunnel(data.funnel)
        };
        console.log(req.cookies.CustomerID);
        if (req.cookies.CustomerID) {
            rp({
                    method: "GET",
                    uri: BASE_URL + '/customers?customerId=' + req.cookies.CustomerID,
                    headers: {
                        "content-type": "application/json",
                        Authorization: "ApiGuid " + API_GUID
                    },
                    json: true
                })
                .then(function (response) {
                    console.log(response);
                    renderData.customer = response.Customers[0];
                    return res.render(templatePath, renderData);
                })
                .catch(function (error) {
                    console.log(error);
                    return res.cookies("CustomerID", null).render(templatePath, renderData);
                })
        } else {
            renderData.customer = {};
            return res.render(templatePath, renderData);
        }
    } else {

        return next();
    }


}

function resolveContainers(url) {
    var containers = {};
    Object.entries(data.routes[url].containers).forEach(function (keyValue) {
        containers[keyValue[0]] = [];
        keyValue[1].forEach(function (componentId) {
            containers[keyValue[0]].push(data.components[componentId]);
        });
    })
    return containers;
}

function parseFunnel(funnel) {
    var steps = {};
    Object.entries(funnel.steps).forEach(function (keyValue) {
        steps[keyValue[0]] = Object.entries(keyValue[1]).map(function (fieldKeyValue) {
            var value = fieldKeyValue[1];
            value.key = fieldKeyValue[0];
            return value;
        }).sort(function (a, b) {
            return a.order > b.order;
        })
    })
    return steps;
}

module.exports = dynamicRoutes