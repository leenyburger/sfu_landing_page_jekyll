---
layout: blog
title: "S3 Rails File Uploads: The Complete How-To Guide"
date: 2021-11-02T14:15:04.195Z
thumbnail: /assets/uploads/undraw_code_review_re_woeb.png
excerpt: "This article describes how to use Ruby on Rails to upload files and
  images to Amazon S3 (S3) on Heroku. In any Rails application, the traditional
  way to upload files is for the files to travel through the application and
  then stream to S3. This is the default behavior of many popular Ruby gems,
  such as Paperclip, CarrierWave, and Active Storage.   While this solution
  works fine for smaller files, it can cause issues on Heroku when trying to
  upload larger files. This is because Heroku uses an ephemeral file system, so
  the larger files may be deleted from the dyno before the files can be uploaded
  to S3. "
permalink: rails-file-upload
---
{{page.excerpt}}

## What is the solution?

One solution to this problem is “direct uploads." A direct upload is when the file is uploaded from the Client (browser) directly to S3. Direct uploading means it doesn’t matter what the Heroku dynos do because the file never touches Heroku.

## How can we do this in Rails 6 and beyond?

Active Storage was introduced as part of the Rails core in 6.1, and it is a good tool to use for direct uploading on Heroku. Let’s get started. 

If you have an existing Rails application that needs direct uploading, jump to Step 3 to get right to the Active Storage code. Otherwise, we’ll scaffold a basic application to get started. 

### Step 1: 

Set up a new Rails application in the folder of your choice. 
`rails new direct_upload_example` `cd direct_upload_example` `bundle install` 

### Step 2: 

At a minimum, we’ll need to add one model. We’ll create a user form with an avatar. Use the scaffold generator to create the necessary files. 
`rails g scaffold user name:string email:string`
`bin/rails db:migrate`

We’ll also need a root route so we don’t have to manually navigate to the users page. In your editor of choice, open `routes.rb` and add `root to: “users#index"`

Now, open the application to make sure it’s up and running: 
`rails s` and navigate to `http://localhost:3000/` - you should see the users index page. 

### Step 3: 

Add Active Storage. Active storage uses three tables in your application’s database named `active_storage_blobs`, `active_storage_variant_records` and `active_storage_attachments`. 

Add active storage and run the migrations:
`bin/rails active_storage:install` 
`bin/rails db:migrate` 

### Step 4: 

Set up S3 and Active Storage credentials in `storage.yml` 

This tutorial uses S3, so you’ll need to add: 
`gem "aws-sdk-s3", require: false` to your `Gemfile` and `bundle install` 

Open `config/storage.yml` Storage.yml is a configuration file that describes what storage services Active Storage will use to store the uploaded files. This tutorial will use S3, so uncomment the S3 section: 

{% highlight ruby %}
amazon:
  service: S3
  access_key_id: <%= Rails.application.credentials.dig(:aws, :access_key_id) %>
  secret_access_key: <%= Rails.application.credentials.dig(:aws, :secret_access_key) %>
  region: us-east-1
  bucket: your_own_bucket
{% endhighlight %}

You then need to tell Rails when to use each environment. It is highly recommended to use different environments for development and production. For this example, we will use S3 for both development and production to test the uploading and confirm files are placed in the correct bucket. Because we want to use Amazon for both development and production environments we’ll need to update  config/storage.yml to have two AWS environments. 

{% highlight ruby %}
amazon_development:
  service: S3
  access_key_id: <%= Rails.application.credentials.dig(:aws, :access_key_id) %>
  secret_access_key: <%= Rails.application.credentials.dig(:aws, :secret_access_key) %>
  region: us-east-1
  bucket: tutorial-development-bucket

amazon_production:
  service: S3
  access_key_id: <%= Rails.application.credentials.dig(:aws, :access_key_id) %>
  secret_access_key: <%= Rails.application.credentials.dig(:aws, :secret_access_key) %>
  region: us-east-1
  bucket: tutorial-production-bucket
{% endhighlight %}

Now we’ll need to tell Rails when to use each environment.

In config/environments/development add the following line: 
`config.active_storage_service = :amazon_development`

In config/environments/production:
`config.active_storage_service = :amazon_production`

## HOW TO GET YOUR AWS CREDENTIALS

Now you’ll need to go to AWS services and create your cloud storage account and set up your S3 buckets. If you have an existing account, go ahead and sign in. If you don’t go aws.amazon.com and create a new account. 

From the AWS console (once you have logged in) Click on “Services in the upper left-hand corner and then click on “S3”

Then click on “Create Bucket” 

![aws-console-find-S3](/assets/uploads/aws_console_find_s3.png)

CIRCLE S3

From the next screen enter the bucket name. 

![aws-new-bucket](/assets/uploads/aws_new_bucket.png)

CIRCLE/POINT TO create_bucket

In this tutorial we’ll set up the development bucket, the production bucket will be set up in the same way. For now, add the bucket name and region and leave the rest of the settings on the default values.

![create-new-bucket-page](/assets/uploads/create-new-bucket-page.png)

We’ll modify settings as necessary later. Click on “Create Bucket” 

Next, you’ll need to set up IAM credentials. You never want to use your root access credentials to create your API keys for security reasons. To create an IAM user, navigate to Services -> IAM  (you’ll have to scroll)

![find_iam](/assets/uploads/find_iam.png)

CIRCLE IAM

From the IAM dashboard, click on Users in the left-hand side navigation bar

Click on “Add Users” to add a new IAM user. 

Add a User name - this tutorial is using the name “tutorial-user”

You then have the choice to set programmatic access and/or console access. These API keys will be used by active storage to upload files, so we only need programmatic access here. 

![add-user-page](/assets/uploads/add-user-page.png)

Click on next-permissions 

Here you have two choices - you can select “AmazonS3FullAccess” or you can create a custom policy. To further protect our account, we’re going to write a custom policy to only allow access to the specific buckets we’re using in this application. Feel free to use the default S3 policy instead. 

To create the further secure policy, click “Create Policy”. This will only be a new window that allows you to specify your policy directly: 

![policy-window](/assets/uploads/policy-window.png)

The following custom policy will allow us to create keys that can only access specified buckets. 

{% highlight ruby %}
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": [
          "arn:aws:s3:::tutorial-development-bucket",
          "arn:aws:s3:::tutorial-production-bucket"
        ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
          "arn:aws:s3:::tutorial-development-bucket/*",
          "arn:aws:s3:::tutorial-production-bucket/*"
          ]
    }
  ]
}
  ]
}
{% endhighlight %}

This policy is separated into two parts because the List action is performed on the bucket itself and the put/get/delete actions are performed on objects *in* the bucket. 

Click through the “Next buttons” until you get to the “Name your policy” page. Give the policy a specific name and a description so you’ll remember what it is! 

![name-policy](/assets/uploads/name-policy.png)

Click on “Create Policy” to finalize the policy. 

Once the policy has been created, you’ll need to create API access keys for the IAM user you just created. 

You should be directed to your IAM policy page. In the left-hand sidebar, click on “users” again.

Click on the user you previously created, and select “Attach existing policies directly” 

![attach-directly](/assets/uploads/attach-directly.png)

Check the policy you just created (tutorial-bucket-policies) and Click “Next: Tags”, then “Next: Review” “Create User” 

If this is successful, you’ll now be on a screen that provides access keys. Download these keys and save them somewhere safe!

![access-keys](/assets/uploads/access-keys.png)

Quick reminder - do not *ever* put your secret access key in plaintext in your application and push to Github (for example). If your keys are exposed you can deactivate them and create new ones from the Users page. 

## RETURN TO RAILS APP

The AWS keys need to be added to your Rails credentials. 

Open the rails credentials file to edit using the following (replace “code” with your editor of choice)

EDITOR='code --wait' bin/rails credentials:edit

Example: If using sublime text 
EDITOR='sublime --wait' bin/rails credentials:edit

Your editor will automatically open `credentials.yml`. Add the AWS keys you downloaded earlier to this file, and close the editor. You can view the credentials at any time using 
`bin/rails credentials:show`

We’re going to add an Avatar to a User. Open `models/user.rb` and add `has_one_attached :avatar`. 

{% highlight ruby %}
class User < ApplicationRecord
  has_one_attached :avatar
end
{% endhighlight %}

Navigate to the user form page `app/views/users/_form.html.erb` and add a file field to accept the avatar file. 

`<%= form.file_field :avatar %>`

You have to whitelist the avatar parameter in the controller. Open `app/controllers/users_controller.rb` and add `avatar` to the whitelisted parameters. 

{% highlight ruby %}
    def user_params
      params.require(:user).permit(:name, :email, :avatar)
    end
{% endhighlight %}

We’ll also want to be able to see the file once it’s been uploaded, so let’s add an image tag to our users#show page. In `app/views/users/show` add 
<%= image_tag @user.avatar %>

Now start up your rails server `rails s`, add an image, and see it upload to S3! 

## DIRECT UPLOADS

If you look at the network log, you’ll see two requests. One to your server and one to S3. 

GET NETWORK REQUEST SCREEN SHOT (network_request_normal_upload)

Direct uploads remove this requirement and put the file directly onto S3. There are a few steps to add direct uploading to your application. 

Add `activestorage.js` to your application. Depending on when you created your Rails application, it may already be included. To use the npm package in `app/javascript/packs/application.js` add:

{% highlight ruby %}
import * as ActiveStorage from "@rails/activestorage"
ActiveStorage.start()
{% endhighlight %}

Add `direct_upload: true` to your file field. 

{% highlight ruby %}
 <%= form.file_field :avatar, direct_upload: true %>
{% endhighlight %}

To use direct uploads with S3, you’ll need to configure the bucket to allow cross-origin requests or CORS from your application. This is done by adding a bucket policy to the bucket. Sign in to your AWS account and navigate to your bucket.

Click on the “Permissions” header:

![select-bucket-permissions](/assets/uploads/select_bucket_permissions.png)

Scroll down to the “CORS policy” section (past the bucket policy section). Add the following policy. Change “AllowedOrigins” to be whatever domain you want to upload from. Remember, the allowed origins must be an exact domain match - in this example, “http://localhost:3000/" would fail because of the additional backslash. 

{% highlight ruby %}
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "PUT"
        ],
        "AllowedOrigins": [
            "http://localhost:3000"
        ],
        "ExposeHeaders": [
            "Origin",
            "Content-Type",
            "Content-MD5",
            "Content-Disposition"
        ],
        "MaxAgeSeconds": 3600
    }
]
{% endhighlight %}

Save the policy and return it to your rails application. 
Upload a file, and the file should directly upload to s3!