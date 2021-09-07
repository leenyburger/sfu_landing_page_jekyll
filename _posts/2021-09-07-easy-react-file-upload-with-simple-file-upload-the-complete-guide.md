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
{{page.excerpt}}

Most devs know that nothing about S3 is easy. The pricing model is ambiguous at best and the integration can be an entire nightmare in and of itself. That's still only half of the problem. What about the file upload? The input? Everyone expects drag-and-drop these days but that's not really an easy thing to build, and again, only half of the problem.  

That's where Simple File Upload comes in. Simple File Upload abstracts out the tough stuff so you can get to building the parts you love!

Today we're going to build a quick file uploader with built-in S3 uploads using the React framework.

## Setting up the Project

We're going to keep this pretty barebones. We'll write some CSS, but the main feature we'll be focusing on is how simple it is to get the Simple File Uploader into your project and working!

I have a folder on my desktop where I keep all of my projects, so we'll start by cd-ing into that directory and running <mark style="background-color: lightgrey">npx create-react-app simple-file-uploader</mark> in the terminal.

From there we're going to install Simple File Upload. They have a React package for it, so we'll just <mark style="background-color: lightgrey">npm install react-simple-file-upload</mark>, and voila- we have it ready to use.

Simple File Upload is a paid solution, so you'll have to create an account and get an API key- which we'll use later in the project. Once we have all of that ready then we can jump into the code!

Now let's get our local server running. In your terminal you want to <mark style="background-color: lightgrey">cd YOUR_PROJECT_NAME</mark> and then run <mark style="background-color: lightgrey">npm run start</mark>. Boom! Let's go!

### Summary:

1. npx create-react-app simple-file-uploader
2. npm install react-simple-file-upload
3. Create an account at simplefileupload.com and grab your API key
4. CD into your project folder and run <mark style="background-color: lightgrey">npm run start</mark>

## Getting into the Code

First things first. Let's jump over to our App.js file and get rid of the react boilerplate.

Strip it all of the way down until it looks like this.

```
javascript
// App.js
import './App.css';
function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
    </div>
  );
}
export default App;
```

This gives us a clean base to work from and now we can get started building.

I always like to come up with a definition of done list when I'm building out projects or features. This is simply a quick list of key functionality we want to ensure exists. In this app, we want to be able to drop images into our Simple File Uploader and have them render in the grid below.

Our Definition of Done could look something like this:
The simple file uploader widget is in the UI
The preview is disabled
The uploaded images render in a grid

We'll refer back to this as we build.

Let's start by giving it a quick "website" feel with some content in the header.

```
html
// App.js
<header className="App-header">
  <h1>Simple File Upload Demo</h1>
  <a className="btn" href="https://simplefileupload.com">
    Try it now!
  </a>
</header>
```

From here, let's get our Simple File Upload widget into the UI. We'll import the SimpleFileUpload package into the project. To do that, we'll add <mark style="background-color: lightgrey">import SimpleFileUpload from 'react-simple-file-upload'</mark> back in our App.js file.

And we'll go ahead and place the widget in the markup as well. Let's put in a <mark style="background-color: lightgrey">main</mark> tag to use as a wrapper for the uploader and our grid.

One very important thing to note about the upload widget is the onSuccess attribute available. This is where you'll call the function you want to happen when a file is successfully uploaded.

This is also where you'll receive access to the S3 generated URL for your asset. This is where you could push that URL to an array, write it to a database, package it up in an email- the sky's the limit.

```
javascript
// App.js
import './App.css';
import SimpleFileUpload from 'react-simple-file-upload';
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Simple File Upload Demo</h1>
        <a className="btn" href="https://simplefileupload.com">
          Try it now!
        </a>
      </header>
      <main>
        <div className="upload-wrapper">
          <SimpleFileUpload
            apiKey="YOUR_API_KEY_GOES_HERE"
            onSuccess={handleUpload}
            preview="false"
          />
        </div>
      </main>
    </div>
  );
}
export default App;
```

You're probably seeing an error right now. Your project is probably yelling at you because <mark style="background-color: lightgrey">handleUpload</mark> doesn't exist. Let's fix that.

Let's create that function just before your return statement. To quickly check that our uploader is working, we can just quickly console the URL.

```
javascript
function handleUpload(url) {
   console.log(url)
  }
```

Now… upload a file! Did it work?! Sweet! So at this point, our upload widget is functioning and we just need to build out our UI a little more.

So in very little code, we've got a working drag-and-drop widget connected straight to Amazon S3 buckets. Isn't that wild? That simple. That quick.

So now your file should be looking something like this.

```
javascript
// App.js
import './App.css';
import SimpleFileUpload from 'react-simple-file-upload';
function App() {
function handleUpload(url) {
   console.log(url)
  }
  return (
    <div className="App">
      <header className="App-header">
        <h1>Simple File Upload Demo</h1>
        <a className="btn" href="https://simplefileupload.com">
          Try it now!
        </a>
      </header>
      <main>
        <div className='upload-wrapper'>
          <SimpleFileUpload
            apiKey='YOUR_API_KEY_GOES_HERE'
            onSuccess={handleUpload}
            preview="false"
          />
        </div>
      </main
    </div>
  );
}
export default App;
```

Let's check our Definition of Done and see where we stand:

- ~~The simple file uploader widget is in the UI~~
- ~~The preview is disabled~~
- The uploaded images render in a grid

Looks like we're almost done! All that's left is to get our uploaded images into a grid!

Since we're not using a database in this project, the easiest way to accomplish this will be to store the image URLs in hook and have our UI display them all.

Our next step is to add <mark style="background-color: lightgrey">import { useState } from 'react'</mark> at the top of our file. After that, we'll create the hook just below the line <mark style="background-color: lightgrey">function App() {</mark>.

We'll just call this uploadedImages. <mark style="background-color: lightgrey">const [uploadedImages, setUploadedImages] = useState([])</mark>.

Now that we have that in place, we can change our handleUpload() to set the images in our hook rather than just logging them out.

```
javascript
function handleUpload(url) {
    setUploadedImages([...uploadedImages, url])
}
```

From there, we just need our front-end to map through the images and display them!

Add this code just below your <mark style="background-color: lightgrey">.upload-wrapper</mark> div

```
javascript
<ul className="image-grid">
  {uploadedImages.length ? (
    uploadedImages.map((image) => (
      <li>
        <img src={image} alt="Fun images" />
      </li>
    ))
   ) : (
   <p>Your uploaded images will appear here!</p>
 )}
</ul>
```

There you go! We're now using Simple File Upload to send images straight to S3 and displaying them in a grid!

The last step is to dress this up just a little bit.

Move over to your App.css file and add the code below

```
css
.App header {
  padding: 1rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.App header h1 {
  font-size: 1.25rem;
}
.btn {
  background: linear-gradient(90deg, #b731dd 0, #4161eb 100%);
  padding: 0.5rem 1.25rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
  font-weight: bold;
  transition: 150ms cubic-bezier(0.6, -0.28, 0.735, 0.045);
  box-shadow: 5px 5px 10px rgba(17, 17, 17, 0.25);
}
.btn:hover {
  transform: scale(1.05);
}
.App header a {
  color: white;
  text-decoration: none;
}
.App main {
  max-width: 1024px;
  margin: 0 auto;
  overflow: hidden;
}
.App .upload-wrapper {
  display: flex;
  justify-content: center;
}
.App main .image-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
  row-gap: 6rem;
  list-style: none;
  margin-top: 6rem;
  text-align: center;
  padding-left: 0;
}
.image-grid p {
  grid-column-start: 2;
  opacity: 50%;
}
.image-grid li {
  overflow: hidden;
  height: 200px;
}
.image-grid img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}
```

## What just happened?

You, my friend, just uploaded images to Amazon S3 in 6 minutes (according to this article's read time)!

So now the tough stuff is out of the way and you can go build the fun parts of your app!