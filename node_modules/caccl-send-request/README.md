# caccl-send-request
The default request sender used throughout the CACCL project.

## Part of the CACCL library
**C**anvas  
**A**pp  
**C**omplete  
**C**onnection  
**L**ibrary  

## Overriding caccl-send-request

Throughout the `caccl` project, the default sendRequest function is this `caccl-send-request` module.

However, if you want to override the sendRequest function, just create your own function that follows the description below. Your function should follow our description _exactly_, including sending of cross-origin credentials.

## Description

Sends an http request, handles paging, retries failed requests, and processes the response.

Argument | Type | Description | Default
:--- | :--- | :--- | :---
host | string | host to send the request to | none
path | string | path to send the request to | none
method | string | http method to use | GET
params | object | query/body/data to include in the request | {}
numRetries | number | number of times to retry the request if it fails | 0
ignoreSSLIssues | boolean | if true, ignores self-signed certificate issues | false usually, true if host is `localhost:8088`

Returns:  
`Promise.<CACCLError|object>` Returns promise that resolves with `{ body, status, headers }` on success, rejects with CACCLError (see `caccl-error` on npm) on failure.

**Note:** This function sends cross-origin credentials if `process.env.DEV` is true or if `process.env.NODE_ENV` equals `development`. 
