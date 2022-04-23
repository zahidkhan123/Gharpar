server '23.106.33.179', user: 'live', roles: %w{app web}, port: 8282

set :application, 'DemoGharparAdmin'

set :deploy_to, '/home/live/DemoGharparAdmin'

set :repo_url, 'ssh://git@gitrepos.com:222/node/GharParAdmin.git'

set :tmp_dir, '/home/live/tmp'

set :build_command, 'npm run build'

set :bundle_without, %w{development test}.join(' ')
