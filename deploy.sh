echo "Switching to Production Branch : productionBranch"
git checkout productionBranch


echo "Buildin App ..."
npm run build 


echo "Deploying file to server ..." 
scp -r build/*   root@77.37.87.8:/var/www/spaManager/

echo "Done !"