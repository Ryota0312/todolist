class CreateTasks < ActiveRecord::Migration[5.1]
  def change
    create_table :tasks do |t|
      t.text :title
      t.text :desc
      t.text :state
      t.integer :mission_id

      t.timestamps
    end
  end
end
