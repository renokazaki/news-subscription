Rails.application.routes.draw do
  devise_for :users, skip: :all

  namespace :api do
    namespace :v1 do
      get 'health', to: 'health#show'

      namespace :auth do
        post 'sign_up', to: 'registrations#create'
        post 'sign_in', to: 'sessions#create'
        delete 'sign_out', to: 'sessions#destroy'
      end

      resource :user, only: [:show, :update]
      resources :interests, only: [:index, :create, :update, :destroy]
      resources :news, only: [:index, :show]
    end
  end
end