get '/' do # render home page
  erb :index
end

#----------- USERS -----------

get '/user/signup' do # render sign-up page
  erb :signup
end

post '/user/signup' do  # sign-up a new user
  # p "index.rb line 14"
  new_user = User.new(params)
  if new_user.save
    session[:user_id] = new_user.id  #Anne: login after register
  else
    #flash[:errors] = "Register errors!"  #secure_password only return false, no error messages?
    erb "<div class='alert alert-message'>Register error</div>"
  end
  redirect '/'
end

#----------- SESSIONS -----------

get '/user/login' do
  erb :login    # render sign-in page
end

post '/user/login' do
  # p "index.rb line 31"
  p attempting_user = User.find_by(username: params[:username]).try(:authenticate, params[:password])
  p attempting_user
  if !!attempting_user
    session[:user_id] = attempting_user.id
  else
    erb "<div class='alert alert-message'>login error</div>"
    #flash[:notice] = "login error"  #why flash error didn't work?
  end
  #redirect '/'
end

get '/user/logout' do
  session[:user_id] = nil
  erb "<div class='alert alert-message'>Logged out</div>"
end

get '/user/spots' do
  if logged_in?
    erb  :layout_dbc
  else
    redirect '/'
  end
end

get '/map' do
  p la = params[:latitude]#.to_f
  p lo = params[:longitude]#.to_f
  p params[:latency].to_i

  erb "<div class='alert alert-message'>Your identity won't be recorded unless logged in</div>"
end
