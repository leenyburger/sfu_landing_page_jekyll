---
layout: blog
title: "Direct File Uploads to Backblaze B2 in Node.js Express Apps: A Complete
  How-To Guide"
date: 2021-12-23T17:38:55.425Z
thumbnail: /assets/uploads/undraw_code_review_re_woeb.png
excerpt: "This article describes how to use Node.js to power direct upload
  functionality to a Backblaze B2 bucket.  This is important for deploying to a
  PAAS as Heroku due to the ephemeral file system. "
permalink: node-file-uploads-on-heroku
---
This article describes how to use Node.js to power direct upload functionality to a Backblaze B2 bucket.

B2 is an S3-compatible object storage service, which means that the approach described in this article can largely be applied to other S3-compatible services too, such as Amazon S3, Linode Object Storage, and DigitalOcean Spaces.

## Why use object storage?

Object storage often considered a good solution for storing user-uploaded content as it is cost-effective, scalable, robust, and can be used to store a wide range of file types.

In particular, Backblaze’s pricing model makes B2 stand out amongst its competitors.

## Why use a direct upload approach?

Some apps accept file uploads through a standard POST request as part of a form submission. In these cases, the server-side code must receive the file, process it, and then proceed to persist it somehow. This may be by writing the contents to a local filesystem, or passing on the object to some other storage mechanism.

Whilst this approach may offer some advantages - such as the ability to run on-the-fly processing, image resizing, watermarking, etc. - these can be largely outweighed by the fact that the server must consume more resources (both CPU and RAM), which means that the approach becomes less scalable.

Furthermore, not all application deployments allow for local filesystem storage, and processing large files server-side may cause requests to timeout. These factors are particularly relevant to apps deployed on Heroku or on a serverless architecture.

As such, this article covers the concept of direct uploading to B2. This means that the browser does the uploading directly to your B2 bucket without files having to go through your server.

## Achieving direct uploads in Node.js

The rest of this article covers the process of building in direct-to-B2 uploading in a Node.js application. Although it’ll focus on a barebones Node.js application, the process can be applied to Node.js running in any environment - including on Heroku or in a serverless deployment.

The article uses the Express framework for easing the generation of a simple webserver. However, the Node.js-specific code can easily be adapted into any other framework.

### Step 1: Setting-up your project

Firstly, ensure your system’s Node.js and NPM installations are up-to-date.

Then, in your terminal, create a new directory for your Express project and change into it:

```shell
mkdir projects/express-b2
cd projects/express-b2
```

Use the `express-generator` tool to scaffold your app:

```shell
npx express-generator
```

A number of files and directories will be created. You can now install the required dependencies:

```shell
npm install
```

Finally, you can test your app by running it:

```shell
npm start
```

Navigate to [localhost:3000](http://localhost:3000) in your web browser and you should see a page that looks like the following.

![Screenshot of the basic Express app being rendered](/assets/uploads/image1.png)

### Step 2: Preparing your client-side code

You can now add some code to form a basic interface to enable a user to select a file to upload.

The Express generator created some "view" files for you, which can be found in the `views/` directory. The default setup uses the Jade templating engine to render HTML, so you'll notice files with the `.jade` extension. If your setup involves writing HTML directly, or uses another templating engine, then the following should be translatable for your particular case.

Rather than creating a whole new view, you can just modify the existing primary index route. To do so, open up `views/index.jade` and add the following to the bottom of the file (inside the `content` block):

```jade
 h2 Upload a file
  input(type="file")

  script.
    document.querySelector('input').onchange = async (event) => {
      const file = event.target.files[0];
      const response = await fetch(`http://localhost:3000/signed-request?name=${file.name}`);
      const { url } = await response.json();
      fetch(url, {
        method: 'PUT',
        body: file
      });
    }
```

This code renders a basic file input, and the script then attaches an `onchange` listener for the input.

The listener function accesses the first file selected in the input and then queries a `/signed-request` route on the Express application. This route hasn't been implemented yet, but you'll do so in Step 3. Once implemented, the route will generate and return a signed `PUT` request that can then be used to upload the file directly to B2.

That's it for the client-side code. Next you'll write the logic for generating the signed request.

### Step 3: Signing your B2 uploads

In order for the browser to upload directly to B2, it needs to use *signed requests*. For security purposes, these are generated server-side, as otherwise the client would have access to your B2 secret keys.

To generate the signed request you can make use of AWS' SDK for working with S3-compatible object storage services. Add the required dependency to your project:

```shell
npm install aws-sdk
```

Next, open up the file `routes/index.js` in your project to add a new route definition. This route will accept information about the file to be uploaded and return a signed request that will enable the browser to complete the upload. Near the top of the file (next to the other imports) import the package we installed earlier:

```javascript
var AWS = require('aws-sdk');
```

Then create the route at the bottom of the same file:

```javascript
router.get('/signed-request', function(req, res, next) {
  var endpoint = new AWS.Endpoint(process.env.B2_ENDPOINT_URL);
  var s3 = new AWS.S3({
    endpoint,
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
    signatureVersion: 'v4',
  });

  var url = s3.getSignedUrl('putObject', {
    Bucket: process.env.B2_BUCKET,  // Bucket name (from environment)
    Key: req.query.name,            // File name (from client request)
    Expires: 60,                    // Request expires in 60 seconds
  });

  res.json({ url });
});
```

Broadly, the code above performs the following:

1. Creates a new endpoint using a Backblaze-specific URL
2. Initializes a new S3 client with the relevant credentials
3. Generates and returns a `putObject` request to the browser

A number of environment variables have been referenced (such as `B2_ENDPOINT_URL` and `B2_BUCKET`). These will be configured during Step 7.

This concludes the changes required to the server-side code. Next, you'll cover creating and configuring your bucket on B2.

### Step 4: Configuring a B2 bucket

Firstly, login to your Backblaze B2 account console by visiting [backblaze.com](https://www.backblaze.com). If you do not yet have a Backblaze account, then you'll need to create an account [here](https://www.backblaze.com/b2/cloud-storage.html).

In the "Buckets" tab of the console, select "Create a Bucket".

![Showing the "Create a Bucket" button](/assets/uploads/image2.png)

In the dialog that opens, enter a name for your bucket and enable any of the other settings you may need. Then click "Create a Bucket" to complete the process. Please note that bucket names must be unique. Make a note of your bucket name, as you'll need this later.

![The "Create a Bucket" interface on B2](/assets/uploads/image3.png)

Once the bucket is created, it will be added to the list of buckets on your account. At this stage, make a note of the "Endpoint" displayed for the bucket, as you'll need this later.

![Finding the "Endpoint" URL for your bucket](/assets/uploads/image4.png)

### Step 5: Creating access credentials

You'll need some credentials in order to give your app the access needed to write objects to your bucket.

In the Backblaze console, navigate to the "App Keys" tab. Here, we will create two sets of keys: one that can be used to manage your B2 account, and another that is specific to this particular app.

Firstly, create the "management" key. To do so, click the "Add a New Application Key" button on this page.

![Showing the "Add a New Application Key" button](/assets/uploads/image5.png)

On the dialog that pops up, enter a name for your key and ensure the key has read/write access to all buckets.

![Creating a new management key](/assets/uploads/image6.png)

Once created, the console will display the `keyID` and `applicationKey` for your new "management" key. Make a note of these as you'll need them later and they only get displayed once.

![Finding the keyId and applicationKey](/assets/uploads/image7.png)

Next, create the key for your application (we'll call this the "application" key). Go through the "Add a New Application Key" process again, but this time restrict the key's access to just the bucket you created earlier.

![Creating a new application key](/assets/uploads/image8.png)

Make a note of the `keyId` and `applicationKey` for this "application" key as above.

### Step 6: Configuring bucket CORS

Cross-origin resource sharing (CORS) needs to be configured on your bucket in order to allow the browser to send `PUT` requests directly to it. This is because web-browsers perform pre-flight checks against target cross-domain servers to ensure the relevant security provisions are in place.

The CORS configuration you need on this bucket needs to be managed using the B2 API, and for this we recommend making use of the official `b2` tool.

To begin, download the B2 tool for your system from the [Backblaze website](https://www.backblaze.com/b2/docs/quick_command_line.html). You can also use Homebrew on Mac: 
`brew install b2-tools`
Rename the downloaded file to `b2` and move it to a sensible place. You'll need to mark it as executable (if you use MacOS or Linux) by running `chmod +x /path/to/b2` on the downloaded file. For the rest of this article we'll assume that the `b2` tool is available in your path and can be invoked simply using the `b2` command.

Login to your B2 account by running the following:

```shell
b2 authorize-account
```

You will be prompted for a key ID and an application key. For these use the details from the "management" key you created in Step 5.

Once you've authenticated the tool you can use it to set the CORS settings for the bucket. To do so, issue the following command:

```shell
b2 update-bucket --corsRules '[
  {
      "corsRuleName": "allowBrowserPut",
      "allowedOrigins": ["*"],
      "allowedHeaders": ["*"],
      "allowedOperations": ["s3_put"],
      "maxAgeSeconds": 3600
  }
]' <bucket name> allPublic
```

You'll need to change `<bucket name>` to the name of the bucket you created in Step 4. You may also wish to change the other attributes of the CORS rules, such as the allowed origins or operations, depending on your required level of security and the scope of usage for this bucket.

### Step 7: Tying everything together

The final step in the setup involves configuring the environment variables accessed by the Node app in Step 3. At this stage, you should have noted:

* The Endpoint URL for your bucket (from Step 4)
* The name of your bucket (from Step 4)
* The `keyId` and `applicationKey` from the "application" key created in Step 5

Create a new file named `envfile` in the root of your Node Express project and add these contents, replacing the values with those noted above:

```
export B2_ENDPOINT_URL="s3.eu-central-003.backblazeb2.com"
export B2_BUCKET="tutorial-bucket"
export B2_KEY_ID="xxxyyyzzz"
export B2_APPLICATION_KEY="aaabbbccc111222333"
```

If you manage your environment variables differently in your application, then instead simply drop them into your existing setup. Either way, we recommend not including your environment variables in your source control system since each of your environments (development, production, etc.) will likely have different variables.

You're now ready to run the complete application!

If your terminal is still running your application, then exit it first by pressing ctrl-C.

Next, load the environment variables you created earlier:

```shell
source envfile
```

Finally, you can run the application again:

```shell
npm start
```

Navigate to [localhost:3000](http://localhost:3000) again to view the new application version, which should look something like the following image.

![The completed application UI](/assets/uploads/image9.png)

Use the file input to select a file, and then browse the bucket contents on the B2 console and you should see the file listed.

![Showing the uploaded file on the B2 console](/assets/uploads/image10.png)

## If things go wrong

If the file doesn't upload, then we recommend checking your browser console or the terminal window running your Node app. One or both of these may print warnings or errors that can help you find the issue.

## Conclusion

In this article we have discussed an approach to achieving basic direct-to-B2 uploads in a Node.js application. Whilst the finished product does not feature additional useful UX enhancements (such as loading indicators or upload previews and confirmations), the technical process for implementing an upload system should provide enough guidance for including such a mechanism in your own applications.