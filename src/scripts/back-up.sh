#! /bin/bash
# Run it on the server with the help of build in command cron like this: "CRON_TZ=Europe/Kiev 0 6 * * * bash ./back-up.sh"

echo 'check existing docker command'
if ! [ -x "$(command -v docker)" ]
then
  echo 'docker command not found'
  exit 1
fi

echo 'check existing docker container of postgres'
if ! [ "$(docker ps | grep trade_db_1)" ]
then
  echo 'Did not found a container with running db'
  exit 1
fi

if ! [ -d "~/db" ]
then
  exec 'mkdir ~/db'
  echo "Directory ~/db created"
fi

echo 'execute creating dump'
exec 'docker exec -it trade_db_1 "PGPASSWORD=abracad322 pg_dump --username postgres tradingdb > ~/db/$(date --iso)_dump.sql"'

echo 'check files in container to be 7 latest'
number_of_dumps=$('docker exec -it trade_db_1 ls | wc -l')
if [ "$number_of_dumps" -gt 7 ]
then
  exec 'docker exec -it trade_db_1 cd ~/db && rm "$(ls -t | tail -1)"'
fi
