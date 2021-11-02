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

We then need to tell Rails when to use each environment. It is highly recommended to use different environments for development and production. 

For this example, we will use S3 for both development and production to test the uploading and confirm files are placed in the correct bucket. Because we want to use AWS for both development and production environments, we’ll need to update `config/storage.yml` to have two AWS environments:

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

Now, we’ll need to tell Rails when to use each environment.

In config/environments/development, add the following line: 
`config.active_storage_service = :amazon_development`

In config/environments/production, add the following line:
`config.active_storage_service = :amazon_production`

## How can we get our AWS credentials?

Now, we'll need to go to AWS services, create our cloud storage account, and set-up our S3 buckets. If you have an existing account, go ahead and sign-in. If you don’t have an exisiting account, go to aws.amazon.com and create a new account. 

### Step 1:

From the AWS console (once you have logged in), click on “Services" in the upper left-hand corner, and then click on “S3.” 

### Step 2:

Click on “Create Bucket.” 

![aws-console-find-S3](/assets/uploads/aws_console_find_s3.png)

### Step 3:

From the next screen enter the bucket name: 

![aws-new-bucket](/assets/uploads/aws_new_bucket.png)

### Step 4:

In this tutorial we’ll set up the development bucket. Note that the production bucket will be set up in the same way. For now, add the bucket name and region and leave the rest of the settings on the default values. We’ll modify the settings later, as needed. Click on “Create Bucket.” 

![create-new-bucket-page](/assets/uploads/create-new-bucket-page.png)

### Step 5:

Next, we'll need to set up IAM credentials. We never want to use our root access credentials to create our API keys for security reasons. To create an IAM user, navigate to Services -> IAM  (you’ll have to scroll).

![find_iam](/assets/uploads/find_iam.png)

From the IAM dashboard, click on "Users" in the left-hand side navigation bar.

Click on “Add Users” to add a new IAM user. 

![click_on_add_users](/assets/uploads/click_on_add_users.png)

### Step 6:

Add a User name - this tutorial is using the name “tutorial-user.”

We then have the choice to set programmatic access and/or console access. These API keys will be used by active storage to upload files, so we only need programmatic access here. 

![add-user-page](/assets/uploads/add-user-page.png)

Click on "Next-Permissions." 

### Step 7: 

Here we have two choices - we can select “AmazonS3FullAccess” or we can create a custom policy. To further protect our account, we’re going to write a custom policy. This will only allow access to the specific buckets that we’re using in this application. Feel free to use the default S3 policy instead. 

To create our custom policy, click “Create Policy.” This will be a new window that will allow us to specify our policy directly: 

![policy-window](/assets/uploads/policy-window.png)

The following custom policy will allow us to create keys that can only access specified buckets. 

{% highlight ruby %}
{
  "Version": "2012-10-17",
  "Statement": \[
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": \[
          "arn:aws:s3:::tutorial-development-bucket",
          "arn:aws:s3:::tutorial-production-bucket"
        ]
    },
    {
      "Effect": "Allow",
      "Action": \[
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

This policy is separated into two parts because the list action is performed on the bucket itself and the put/get/delete actions are performed on objects *in* the bucket. 

Now, we'll click through the “Next buttons” until we get to the “Name your policy” page. Give the policy a specific name and a description so we'll remember what it is! 

![name-policy](/assets/uploads/name-policy.png)

Click on “Create Policy” to finalize the policy. 

### Step 7:

Once the policy has been created, we'll need to create API access keys for the IAM user we just created. 

We should be directed to our IAM policy page. In the left-hand sidebar, click on “users” again.

Click on the user we previously created, and select “Attach existing policies directly.” 

![attach-directly](/assets/uploads/attach-directly.png)

Check the policy that we just created (tutorial-bucket-policies), and click “Next: Tags,” then “Next: Review,” then “Create User.” 

If this is successful, we'll now be on a screen that provides access keys. Download these keys and save them somewhere safe!

![access-keys](/assets/uploads/access-keys.png)

Quick reminder - we do not *ever* want to put our secret access key in plaintext in our application and push to Github (for example). If our keys are exposed, we can deactivate them and create new ones from the Users page. 

## How do we add the AWS keys to our Rails credentials?

### Step 1:
Open the Rails credentials file to edit using the following (replace “code” with your editor of choice):

EDITOR='code --wait' bin/rails credentials:edit

Example: If using sublime text 
EDITOR='sublime --wait' bin/rails credentials:edit

Your editor will automatically open `credentials.yml`. Add the AWS keys you downloaded earlier to this file, and close the editor. You can view the credentials at any time using: 
`bin/rails credentials:show`

### Step 2: 
We’re going to add an Avatar to a User. Open `models/user.rb` and add `has_one_attached :avatar`. 

{% highlight ruby %}
class User < ApplicationRecord
  has_one_attached :avatar
end
{% endhighlight %}

Navigate to the user form page: `app/views/users/_form.html.erb` and add a file field to accept the avatar file. 

`<%= form.file_field :avatar %>`

We'll have to whitelist the avatar parameter in the controller. Open `app/controllers/users_controller.rb` and add `avatar` to the whitelisted parameters. 

{% highlight ruby %}
    def user_params
      params.require(:user).permit(:name, :email, :avatar)
    end
{% endhighlight %}

We’ll also want to be able to see the file once it’s been uploaded, so let’s add an image tag to our users#show page. In `app/views/users/show` add 
<%= image_tag @user.avatar %>

### Step 3:
Now start up your rails server `rails s`, add an image, and see it upload to S3! 

## Add direct uploading to your application

If you look at the network log, you’ll see two requests. One to your server and one to S3. 

GET NETWORK REQUEST SCREEN SHOT (network_request_normal_upload)

Direct uploads remove this requirement and put the file directly onto S3. There are a few steps to add direct uploading to your application. 

### Step 1:
Add `activestorage.js` to your application. Depending on when you created your Rails application, it may already be included. To use the npm package in `app/javascript/packs/application.js` add:

{% highlight ruby %}
import * as ActiveStorage from "@rails/activestorage"
ActiveStorage.start()
{% endhighlight %}

Add `direct_upload: true` to your file field. 

{% highlight ruby %}
 <%= form.file_field :avatar, direct_upload: true %>
{% endhighlight %}

### Step 2:
To use direct uploads with S3, we'll need to configure the bucket to allow cross-origin requests or CORS from our application. This is done by adding a bucket policy to the bucket. Sign in to your AWS account and navigate to your bucket.

Click on the “Permissions” header:

![select-bucket-permissions](/assets/uploads/select_bucket_permissions.png)

Scroll down to the “CORS policy” section (past the bucket policy section). Add the below policy. Change “AllowedOrigins” to be whatever domain you want to upload from. Remember, the allowed origins must be an exact domain match. In this example, “http://localhost:3000/" would fail because of the additional backslash. 

{% highlight ruby %}
\[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": \[
            "PUT"
        ],
        "AllowedOrigins": \[
            "http://localhost:3000"
        ],
        "ExposeHeaders": \[
            "Origin",
            "Content-Type",
            "Content-MD5",
            "Content-Disposition"
        ],
        "MaxAgeSeconds": 3600
    }
]
{% endhighlight %}

Save the policy and return it to your rails application. Upload a file, and the file should directly upload to S3!