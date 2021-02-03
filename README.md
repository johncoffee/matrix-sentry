# Installing

`npm install`  

`cp .env.template .env`
       

# Deployment

`npm run deploy`

### Cron jobs

`gcloud app deploy cron.yaml --project wtg-server-staging`  
or  
`gcloud app deploy cron.yaml --project endless-x-291311`

# testing

`npm test`

### gcloud cli

Get set up with a user on google cloud.
Peter might need to do stuff in that regard....

https://cloud.google.com/sdk/docs/quickstart

Then follow the instructions. See also [gcloud-setup.md](docs/gcloud-setup.md)

See also  
https://cloud.google.com/appengine/docs/standard/nodejs/running-custom-build-step#example


# Development

**Database connection** proxy using cloud_sql_proxy tool. No more passwords :)  
`./cloud_sql_proxy -instances=endless-x-291311:europe-north1:wtg-db -dir /tmp/cloudsql`

Development using Nodemon, or `npm run develop`    
`nodemon --exec 'ts-node src/index.ts' -e ts,json`  

..or using webstorm  
![](./docs/Screenshot%202020-10-03%20at%2010.58.40.png)

See  
https://www.jetbrains.com/help/webstorm/running-and-debugging-typescript.html#ws_ts_server_run_create_node_rc

# Misc

`git remote | xargs -L1 git push --all`


#### Troubleshooting

if something like 

    RepositoryNotFoundError: No repository for "Level" was found. Looks like this entity is not registered in current "default" connection?      
    
Shows up, then delete all javascript files from the repo..