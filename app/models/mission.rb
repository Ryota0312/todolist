class Mission < ApplicationRecord
  acts_as_nested_set
  has_many :task
end
