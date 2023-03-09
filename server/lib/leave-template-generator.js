'use strict'
const moment = require('moment');
const Promise = require('bluebird'),
    path = require('path'),
    EmailTemplate = require('email-templates').EmailTemplate;


const TEMPLATE_PATH = '../views/leave-templates'

// Generate leave template
var leaveTemplateGenerator = function(templateName, templateData ={}){
    return new Promise(function(resolve,reject){
        if (templateName === '' || typeof templateName === 'undefined') {
            return reject('No template name received')
        } else {
            templateData.moment = moment;
            getTemplatePath(templateName,templateData)
            .then(createTemplate)
            .then(function(template){
                resolve(template);
            })
            . catch(function(error){
                reject(`There was a problem generating email template. ErrorTrace: ${error}`)
            })
        }
    });
}


// get the directory name where the leave type template exists
var getTemplatePath = function(templateName,templateData){
    return new Promise(function(resolve,reject){
        if (templateName === '' || typeof templateName === 'undefined') {
            return reject('required Fields not reveived')
        } else {
            var templateDir = path.join(__dirname,TEMPLATE_PATH,templateName);
            if (templateDir !== '') {
                    resolve({ name: templateName, data: templateData, directory:templateDir });
            } else {
                    reject(`Unable to find template: ${templateName} on ${templateDir}`);
            }
        }
    })
}

// create leave template
var createTemplate = function(template){
    return new Promise(function(resolve,reject){
        var leaveMail = new EmailTemplate(template.directory);
        leaveMail.render(template.data, function(error, result){
            if(error){
                reject(`There was a error creating template. Error${error}`)
            } else {
                resolve(result)
            }
        })
    })
}

module.exports.leaveTemplateGenerator = leaveTemplateGenerator;