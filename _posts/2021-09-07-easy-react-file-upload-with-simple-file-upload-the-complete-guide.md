---
layout: blog
title: "Easy React File Uploads with Simple File Upload: The Complete Guide "
date: 2021-09-07T14:54:30.991Z
thumbnail: /assets/uploads/undraw_code_review_re_woeb.png
excerpt: "What would you say are the two most difficult things to do in
  front-end programming for you? State management? Data integrity? Those are
  valid choices, and there's plenty more that you could add, but for me -- the
  answer would be working with Amazon S3 and file uploads.  "
permalink: easy-react-file-upload
---
<p align="justify">{{page.excerpt}}</p>

<p align="justify">Most devs know that nothing about S3 is easy. The pricing model is ambiguous at best and the integration can be an entire nightmare in and of itself. That's still only half of the problem. What about the file upload? The input? Everyone expects drag-and-drop these days but that's not really an easy thing to build, and again, only half of the problem.</p> 

<p align="justify">That's where Simple File Upload comes in. Simple File Upload makes react file uploads easy so that you can get to building the parts you love!</p>

<p align="justify">Today we're going to build a quick file uploader with built-in S3 uploads using the React framework.</p>

## Setting up the Project

<p align="justify">We're going to keep this pretty barebones. We'll write some CSS, but the main feature we'll be focusing on is how simple it is to get the Simple File Uploader into your project and working!</p>

<p align="justify">I have a folder on my desktop where I keep all of my projects, so we'll start by cd-ing into that directory and running <i><mark style="background-color: lightgrey">npx create-react-app simple-file-uploader</mark></i> in the terminal.</p>

<p align="justify">From there we're going to install Simple File Upload. They have a React package for it, so we'll just <i><mark style="background-color: lightgrey">npm install react-simple-file-upload</mark></i>, and voila- we have it ready to use.</p>

<p align="justify">Simple File Upload is a paid solution, so you'll have to create an account and get an API key- which we'll use later in the project. Once we have all of that ready then we can jump into the code!</p>

<p align="justify">Now let's get our local server running. In your terminal you want to <i><mark style="background-color: lightgrey">cd YOUR_PROJECT_NAME</mark></i> and then run <i><mark style="background-color: lightgrey">npm run start</mark></i>. Boom! Let's go!</p>

### Summary:

1. npx create-react-app simple-file-uploader
2. npm install react-simple-file-upload
3. Create an account at simplefileupload.com and grab your API key
4. CD into your project folder and run <i><mark style="background-color: lightgrey">npm run start</mark></i>

## Getting into the Code: Easy React File Uploads

<p align="justify">First things first. Let's jump over to our App.js file and get rid of the react boilerplate. Strip it all of the way down until it looks like this.</p>

![remove react boilerplate](/assets/uploads/react_one.png)

<p align="justify">This gives us a clean base to work from and now we can get started building.</p>

<p align="justify">I always like to come up with a definition of done list when I'm building out projects or features. This is simply a quick list of key functionality we want to ensure exists. In this app, we want to be able to drop images into our Simple File Uploader and have them render in the grid below.</p>

Our Definition of Done could look something like this:

* The simple file uploader widget is in the UI
* The preview is disabled
* The uploaded images render in a grid

<p align="justify">We'll refer back to this as we build. Let's start by giving it a quick "website" feel with some content in the header.</p>

![content in header](/assets/uploads/react_two.png)

<p align="justify">From here, let's get our Simple File Upload widget into the UI. We'll import the SimpleFileUpload package into the project. To do that, we'll add <i><mark style="background-color: lightgrey">import SimpleFileUpload from 'react-simple-file-upload'</mark></i> back in our App.js file.</p>

<p align="justify">And we'll go ahead and place the widget in the markup as well. Let's put in a <i><mark style="background-color: lightgrey">main</mark></i> tag to use as a wrapper for the uploader and our grid.</p>

<p align="justify">One very important thing to note about the upload widget is the onSuccess attribute available. This is where you'll call the function you want to happen when a file is successfully uploaded.</p>

<p align="justify">This is also where you'll receive access to the S3 generated URL for your asset. This is where you could push that URL to an array, write it to a database, package it up in an email- the sky's the limit.</p>

![Add Simple File Upload widget to UI](/assets/uploads/react_three.png)

<p align="justify">You're probably seeing an error right now. Your project is probably yelling at you because <i><mark style="background-color: lightgrey">handleUpload</mark></i> doesn't exist. Let's fix that.</p>

<p align="justify">Let's create that function just before your return statement. To quickly check that our uploader is working, we can just quickly console the URL.</p>

![console the URL](/assets/uploads/react_four.png)

<p align="justify">Now… upload a file! Did it work?! Sweet! So at this point, our upload widget is functioning and we just need to build out our UI a little more.</p>

<p align="justify">So in very little code, we've got a working drag-and-drop widget connected straight to Amazon S3 buckets. Isn't that wild? That simple. That quick.</p>

<p align="justify">So now your file should be looking something like this.</p>

![drag-and-drop widget](/assets/uploads/react_five.png)

Let's check our Definition of Done and see where we stand:

* ~~The simple file uploader widget is in the UI~~
* ~~The preview is disabled~~
* The uploaded images render in a grid

<p align="justify">Looks like we're almost done! All that's left is to get our uploaded images into a grid!</p>

<p align="justify">Since we're not using a database in this project, the easiest way to accomplish this will be to store the image URLs in hook and have our UI display them all.</p>

<p align="justify">Our next step is to add <i><mark style="background-color: lightgrey">import { useState } from 'react'</mark></i> at the top of our file. After that, we'll create the hook just below the line <i><mark style="background-color: lightgrey">function App() {</mark></i>.</p>

<p align="justify">We'll just call this uploadedImages. <i><mark style="background-color: lightgrey">const \[uploadedImages, setUploadedImages] = useState(\[])</mark></i>.</p>

<p align="justify">Now that we have that in place, we can change our handleUpload() to set the images in our hook rather than just logging them out.</p>

![store image URLs in hook](/assets/uploads/react_six.png)

<p align="justify">From there, we just need our front-end to map through the images and display them!</p>

<p align="justify">Add this code just below your <i><mark style="background-color: lightgrey">.upload-wrapper</mark></i> div.</p>

![map front-end through images](/assets/uploads/react_seven.png)

<p align="justify">There you go! We're now using Simple File Upload to send images straight to S3 and displaying them in a grid!</p>

<p align="justify">The last step is to dress this up just a little bit. Move over to your App.css file and add the code below.</p>

![App.css file code](/assets/uploads/react_eight.png)

## What just happened?

<p align="justify">You, my friend, just uploaded images to Amazon S3 in 6 minutes (according to this article's read time). React file uploads are easy with Simple File Upload, so you can focus on building the fun parts of your app!</p>