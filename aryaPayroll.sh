#Stash all uncommitted changes
echo "Stashing All Uncommitted changes"
sudo git stash

#Update code from master branch
echo "Fetching master branch from remote"
sudo git pull origin master

#reload all pm2 servers
pm2 reload all

cd client
echo "Creating Angular build"
#npm run-script build
npm run-script build --configuration=test

