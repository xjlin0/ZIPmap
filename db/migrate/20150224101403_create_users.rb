class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :username
      t.string :password_digest   #:password_hash is for bcrypt.
      t.string :email

      t.timestamps
    end
  end
end
