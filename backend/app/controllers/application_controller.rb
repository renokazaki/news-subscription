class ApplicationController < ActionController::API
  before_action :authenticate_user!

  private

  def authenticate_user!
    # Authorization ヘッダーからJWTを取得・検証
    token = request.headers['Authorization']&.split(' ')&.last
    return render_unauthorized unless token

    begin
      @current_user = Warden::JWTAuth::UserDecoder.new.call(token, :user, nil)
    rescue JWT::DecodeError, JWT::ExpiredSignature, Warden::JWTAuth::Errors::RevokedToken, NoMethodError
      render_unauthorized
    end
  end

  def current_user
    @current_user
  end

  def render_unauthorized
    render json: { error: 'Unauthorized' }, status: :unauthorized
  end
end