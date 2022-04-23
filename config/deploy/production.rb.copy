server '23.106.33.133', user: 'live', roles: %w{app web}, port: 8282
server '23.106.33.142', user: 'live', roles: %w{app web}, port: 8282

set :application, 'GharparAdmin'
  
set :deploy_to, '/home/live/GharparAdmin'

set :repo_url, 'ssh://git@gitrepos.com:222/node/GharParAdmin.git'

set :tmp_dir, '/home/live/tmp'

set :bundle_without, %w{development test}.join(' ')
