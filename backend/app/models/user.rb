class User < ApplicationRecord
  has_secure_password
  
  has_many :restaurants, dependent: :destroy
  
  validates :email, presence: true, uniqueness: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }
  validates :role, presence: true, inclusion: { in: %w[admin user] }
  
  enum role: { user: 'user', admin: 'admin' }
  
  def admin?
    role == 'admin'
  end
end




