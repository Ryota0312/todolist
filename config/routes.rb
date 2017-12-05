Rails.application.routes.draw do
  root :to => 'missions#index'

  get 'missions/change_state' => 'missions#change_state'
  
  resources :tasks
  resources :missions
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
