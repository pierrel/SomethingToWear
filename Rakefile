require 'json'
require 'hpricot'

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
    
    # make sure only prod urls are in the urls file
    urls = JSON.parse(File.read("sammy/static/urls.json"))
    File.open("#{tmp_dir}/static/urls.json", 'w') { |file| file.write(JSON.generate(urls['prod']))}
    
    # put the analytics string into the index file
    index = Hpricot(File.read("sammy/index.html"))
    index.at('body').after(File.read("sammy/templates/analytics.html"))
    File.open("#{tmp_dir}/index.html", 'w') { |file| file.write(index.to_html)}
        
    `scp -r #{tmp_dir}/* #{to_path}`
  end
  
  desc 'Deploys both the couch app and sammy application to production'
  task :all => [:couch, :sammy] do
  end
end