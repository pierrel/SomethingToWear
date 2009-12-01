require 'json'

namespace :deploy do
  desc 'pushes the couch couchapp'
  task :couch do
    if File.exists?('couch/.couchapprc')
      `cd couch && couchapp push prod`
    else
      raise 'Please create a .couchapprc file in the couch directory that looks like this: http://gist.github.com/227484'
    end
  end
  
  desc 'deploys the sammy application to the prod server'
  task :sammy do
    to_path = "pierrel@174.143.156.7:/var/somethingtowear/www"
    tmp_dir = "/tmp/sammy"
    
    `rm -rf #{tmp_dir}` if File.exists? tmp_dir
    `mkdir #{tmp_dir}`
    
    `cp -R sammy/* #{tmp_dir}`
    
    urls = JSON.parse(File.read("sammy/static/urls.json"))
    File.open("#{tmp_dir}/static/urls.json", 'w') { |file| file.write(JSON.generate(urls['prod']))}
    
    `cp /tmp/urls.json #{tmp_dir}`
    
    `scp -r #{tmp_dir}/* #{to_path}`
  end
end