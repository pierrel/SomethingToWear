desc 'pushes the couch couchapp'
task :pushCouch do
  if File.exists?('couch/.couchapprc')
    `cd couch && couchapp push`
  else
    raise 'Please create a .couchapprc file in the couch directory that looks like this: http://gist.github.com/227484'
  end
end

desc 'pushes the _auth couchapp'
task :pushAuth do
  if File.exists?('_auth/.couchapprc')
    `cd _auth && couchapp push`
  else
    raise 'Please create a .couchapprc file in the _auth directory that looks like this: http://gist.github.com/227484'
  end
end

desc 'pushes both couchapps'
task :pushCouchapps => [:pushAuth, :pushCouch]