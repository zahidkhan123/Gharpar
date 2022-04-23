require 'json'

namespace :pm2 do

  # def app_status
  #   within current_path do
  #     ps = JSON.parse(capture :pm2, :jlist)
  #     if ps.empty?
  #       return nil
  #     else
  #       # status: online, errored, stopped
  #       if ps && ps[1] && ps[1]["pm2_env"]
  #         return ps && ps[1] && ps[1]["pm2_env"]["status"]
  #       else
  #         return nil
  #       end
  #     end
  #   end
  # end

  # def start_app
  #   within current_path do
  #     execute :pm2, :start, File.join(current_path,'ecosystem.config.js')
  #   end
  # end  

  # def delete_app
  #   within current_path do
  #     execute :pm2, :delete, :all
  #   end
  # end  

  # def restart_app
  #   within current_path do
  #     execute :npm, :run, :build
  #     info '---------------'
  #   end
  # end
  
  # def stop_app
  #   within current_path do
  #     execute :pm2, :stop, :all
  #   end
  # end

  # desc 'PM2 flush'
  # task :pm2_flush do
  #   on roles(:app) do
  #     within current_path do
  #       execute :pm2, :flush
  #     end
  #   end
  # end
  

  # desc 'Node version'
  # task :node_version do
  #   on roles(:app) do
  #     within current_path do
  #       execute :node, '--version'
  #     end
  #   end
  # end
  

  # desc 'Start apps'
  # task :start do
  #   on roles(:app) do
  #     start_app
  #   end
  # end
  
  # desc 'Delete apps'
  # task :delete do
  #   on roles(:app) do
  #     info '---------'
  #     info app_status
  #     info '---------'
  #     case app_status
  #     when 'stopped'
  #       info 'App is stopped'
  #       delete_app
  #     when 'errored'
  #       info 'App has errored'
  #       delete_app
  #     when 'online'
  #       info 'App is online'
  #       delete_app
  #     end
  #   end
  # end
  
  # desc 'Stop apps'
  # task :stop do
  #   on roles(:app) do
  #     stop_app
  #   end
  # end

  # desc 'Restart app gracefully'
  # task :restart do
  #   on roles(:app) do
  #     case app_status
  #     when nil
  #       info 'App is not registerd'
  #       start_app
  #     when 'stopped'
  #       info 'App is stopped'
  #       restart_app
  #     when 'errored'
  #       info 'App has errored'
  #       restart_app
  #     when 'online'
  #       info 'App is online'
  #       restart_app
  #     end
  #   end
  # end
  
end