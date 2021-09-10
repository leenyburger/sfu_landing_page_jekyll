---
layout: blog
title: The Complete Guide to using a CDN with Active Storage
date: 2021-08-18T16:12:26.008Z
thumbnail: /assets/uploads/undraw_folder_files_nweq.svg
excerpt: In Rails versions prior to 6.1, Active Storage only served files from
  an expiring URL that redirected to the selected service. This made it
  impossible to serve the files via a CDN. There were many workarounds to this
  problem, and fortunately Rails introduced the new proxy features for serving
  files from Active Storage in Rails 6.1.
permalink: active-storage-cdn
---
{{page.excerpt}}

## What does the proxy feature do?

The proxy feature provides a permanent URL to an asset through your Rails application instead of an expiring URL. This enables you to put a CDN between your application and the browser. When a user requests an asset from your site the architecture looks like this: 

![Basic CDN Architecture](/assets/uploads/basic_cdn_architecture_screenshot.png)

The first time an asset is requested, it will be served by your application. On all subsequent requests, it will be served from the CDN. To test this, access a file served by active storage. Here is one as an example: [View this link to see a proxied URL](https://test.files-simplefileupload.com/static/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbGt2IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--724f7dbc977e981a72a0dda21206a083d92b24ef/bruno-cervera-eOf0PO0FX6o-unsplash.jpg).

Open the “Network” tab in developer tools and request the resource again (i.e. refresh the page). You can see HIT in the cache headers, showing the file was served from a CDN, not from your application.

![cache hit](/assets/uploads/cache_hit.png)

## Why is this important?

A lot of the workarounds the community was doing before Rails 6.1 involved creating a direct URL using the object key and the desired CDN domain. There were a few problems with this. 

First of all, if you were serving public files from S3, the storage providers usually required the domain name and the bucket name to be identical. This really became a problem if you were using wildcard subdomains. 

Also it made it tricker to switch storage providers. It was possible, but there were necessary DNS changes and the buckets still had to conform to the specified naming conventions. 

With the new proxy feature switching storage providers is as easy as updating <i><mark style="background-color: lightgrey">storage.yml</mark style> in your rails application. You can also now easily use wildcard subdomains and have more freedom in naming your buckets.

## How do you implement this change?

Assuming you have Active Storage set up and you’re trying to add a CDN, all you need to do is update your routing and serving of files.

In your `storage.yml`, add the `public:true` setting to your configuration if you haven’t already done so:

![storage.yml](/assets/uploads/storageyml_screenshot.png)

In a standard Active Storage configuration, you serve the file using <br>`<%= image_tag(@user.avatar) %>` (for example). This provides you an *expiring* URL that redirects to your storage service. You’ll notice the URL typically has the word “redirect” in the path. <br>

Using the default Active Storage serving service, the URL will look like the one below: <br>
> http://localhost:3000/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCZz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--c5090cc1490554569fbdd6a90ad0f99ae1f416e8/matthijs-van-schuppen-8jGB-ud8MtI-unsplash.jpg

Notice the *blobs/redirect* string in the URL. If you click an expiring URL it will redirect to your bucket and eventually expire. Which means it can’t be cached by a CDN.

To use a CDN, you need to change the URL to be permanent. One way to do this is to modify the `routes.rb` file and use the route directly.

![cdn proxy routes](/assets/uploads/cdn_routes_screenshot.png)

In your view you can now use `<%= image_tag cdn_image_url(@user.avatar) %>`. If you look at the generated URL, you will see it now contains the string `blob/proxy` and when you click it you are not redirected to the bucket/key endpoint:<br>
> “http://localhost:3000/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCZz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--c5090cc1490554569fbdd6a90ad0f99ae1f416e8/matthijs-van-schuppen-8jGB-ud8MtI-unsplash.jpg"

If you don’t have your CDN set up at this point, you can use your app host in the `CDN_HOST` variable, and the assets will still resolve correctly. 

With the setup just described, you can still use the redirect URL alongside the `cdn_url` as needed. The following routes both work. The first produces the redirect URL, and the second produces the proxy URL.

* `<%= image_tag (@user.avatar)%>` creates a redirect URL

* `<%= image_tag cdn_image_url(@user.avatar) %>` creates a proxy URL

## What if I want to proxy all my files?

If you want to proxy all your files, you can add an initializer to your application. Create an `active_storage.rb` file in `config/initializers` with the following:

`Rails.application.config.active_storage.resolve_model_to_route = :rails_storage_proxy` 

You can then *remove* the `cdn_routes` created in the previous step, and all files will use the proxy URL. So in this case with one additional line in the configuration a standard `<%= image_tag (@user.avatar), width: 500, height: 500 %>` will produce a proxy URL.

## What about the route helpers?

Another option is to use route helpers directly. With no `active_storage.rb` configuration and no `cdn_image` routes defined, you can use `<%= image_tag rails_storage_proxy_path(@user.avatar), height: 100, width: 100 %>` directly in your view to generate the proxy URL. 

This helper accepts parameters, so you can specify your CDN host if desired: `rails_storage_proxy_url(@user.avatar, host: Rails.application.credentials.dig(:CDN_HOST), protocol: “https")`

## How do I connect my CDN to my application? 

The architecture for the complete DNS and CDN setup for the application will look something like this:

![Configuring a CDN ](/assets/uploads/cdn_architecture_screenshot.png)

## How do I configure a CDN? 

* **Select a CDN.** For this article, we’ll use the [Expedited CDN](https://devcenter.heroku.com/articles/expeditedcdn) provided in the Heroku application store. We’ll also deploy the application with Heroku. If using Heroku, add your custom domain to your Heroku application. This is available on the Settings tab of your Heroku application.

![Custom Domain Heroku ](/assets/uploads/custom_domains_heroku_screenshot.png)

* **Add the target to your DNS provider.** After you add a custom domain with Heroku, Heroku will provide you a DNS record. Add this record to your domain's DNS configuration. Here’s an example of what that might look like with NameCheap as a DNS provider:

![DNS target](/assets/uploads/cname_screenshot.png)

* **Complete the Setup of Expedited CDN or the CDN of your choice.** Typically at this point, you will be prompted by your CDN provider to add additional DNS records to start using the CDN. Expedited CDN with Heroku will provide a set of prompts to configure the service. The first step is to select the Heroku domain you would like to use with the CDN. Follow the prompts to add additional DNS records.

![Select Domain](/assets/uploads/select_domain_screenshot.png)

* **Wait for the DNS to resolve.** After the DNS has resolved, complete the CDN setup. Add the `CDN_HOST` as an environment variable on your production environment.

That's it! Once all the DNS changes have propagated, the setup is complete. The very first time a file is requested, the request will go through your Rails application, and subsequent requests will be served via the CDN.

Here at Simple File Upload, we've taken all of the pain out of this process and provide a drop-in javascript widget to upload and serve files from a CDN *for you*. Try it free for 7 days!