source 'https://rubygems.org'
ruby '2.0.0'

# PostgreSQL driver
gem 'pg'

# Sinatra driver
gem 'sinatra'
gem 'sinatra-contrib'

gem 'activesupport', '~>4.1'
gem 'activerecord', '~>4.1'

gem 'rake'
gem 'puma'

gem 'bcrypt'   #for using has_secure_password
gem 'rack-flash3' #Zac's suggestion for rack flash
group :test do
  gem 'shoulda-matchers'
  gem 'rack-test'
  gem 'rspec'
  gem 'capybara'
end

group :test, :development do
  gem 'psych'  # for irbtools
  gem 'irbtools'
  gem 'factory_girl'
  gem 'faker'
  gem 'shotgun'
end
