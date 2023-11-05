# HackerRank + VS Code

<img src="./media/header.png" width="100%">

### HackerRank + VS Code lets you solve HackerRank challenges in VS Code

![Static Badge](https://img.shields.io/badge/BUILT_FOR-HACKERRANK-%2301ac4b?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/BUILT_WITH-LOVE-orange?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/STATUS-SUCCESS-blue?style=for-the-badge)

## 0. Table of Contents

1. [Overview](#1-overview)
2. [Install](#2-install)
3. [HackerRank provides an API for developers, right?](#3-hackerrank-provides-an-api-for-developers-right)
   - [I used HackerRank's internal API](#31-i-used-hackerranks-internal-api-heres-how)
   - [But what about protected routes?](#32-but-what-about-protected-routes)
   - [Authentication and mitigation of CSRF attacks](#33-authentication-and-prevention-from-csrf-attacks)
   - [How the extension authenticates the users?](#34-how-the-extension-authenticates-the-users)
   - [Authentication flow in the extension](#35-authentication-flow-in-the-extension)
4. [Where does the user data go?](#4-where-does-the-user-data-go)
   - [What does .hackerrankrc file do?](#41-what-does-hackerrankrc-file-do)
   - [Where is the solution code being saved?](#42)
5. [Release Notes](#5-release-notes)
   - [Version](#51-version-010)
   - [Features](#52-features)
6. [Future Ideas](#6-future-ideas)
7. [How to contribute?](#7-how-to-contribute)
8. [References](#8-references)

## 1. Overview

This project was an attempt to bring Hackerrrank into our good old VS Code as an extension. This extension allows us to leverage the in-built debugging tools, version control system, and infinite customizability of VS Code.

Hackerrank does not come with debugging tools and neither has direct integration with Github for version control. Snippet support is not very flexible. Most of the developers are much more adept at VS Code and would rather prefer coding here than on the hackerrank platform. This is where this extension comes in!

<br>

<img src="./media/main.gif">

## 2. Install

1. Clone the repository locally

```bash
git clone https://github.com/Suyash-Purwar/hackerrank-vscode.git
```

2. Move inside the folder and open VS Code

```bash
cd hackerrank-vscode && code .
```

3. Press 'F5' to start the debugger. A new VS Code window will open with the extension running.

## 3. Hackerrank provides an API for developers, right?

### 3.1 I used HackerRank's Internal API. Here's how.

Hackerrank does not provide any out-of-the-box API to access its platform's capabilities. I had to resort to browser inspection tools to identify what calls were being made for which data. This way I figured out the API endpoints, request and response headers, and request and response payload format.

For example, to detect an API endpoint for fetching all the challenges for a specific topic, say Java, here's how I found the endpoint.

1. Open your browser and press F12 to open developer tools. Go to the network tab.

2. Now, open the page for which you want to see network calls. In my case, it's `hackerrank.com/domain/java`.

3. A bunch of network calls will appear. In my case, we are just looking for Fetch/XHR API calls. In the below image, I have set up a filter to show only those requests.

4. This filter shortens our list of network calls. Now, we just need to explore these calls. With some exploration, it becomes clear which call is for what. Here, the '/challenges' endpoint is of interest to us.

5. Upon selecting a particular call, another pain opens which contains details for that particular call. The Header, Payload, Response, and Cookie tabs can tell us the whole anatomy of the call.
   <br>

<img src="./media/inspection.png" width="100%"/>

### 3.2 But what about protected routes?

My initial idea was to collect the user's email and password, and then make a POST request to the /login endpoint. I would then store the received cookie locally. To access any protected routes, I would simply utilize this cookie. This did not work as HackerRank’s authentication flow is not so straightforward.

HackerRank has a security measure in place to prevent CSRF attacks. This security measure presented challenges in accessing the protected routes. Before moving further, it’s essential to understand how HackerRank authenticates the users and how it became a problem for me to use the cookies.

### 3.3 Authentication and prevention from CSRF attacks

Hackerrank utilizes CSRF tokens to prevent CSRF attacks. While my application does not carry out CSRF attacks, this security measure presented challenges in accessing the protected routes.

It's important to understand how Hackerrank authenticates its users. The steps are described below:

1. Hackerrank's login page has an csrf token embedded in its HTML page, and cookies are also returned.
2. When the user provides their email and password, a POST request is made to the `/login` page with the user credentials, csrf token, and cookies.
3. After successful authentication, a new csrf token is returned. This token is used in conjunction with cookies to access the protected routes.

Based on my personal analysis, it appears that the generated CSRF token is mapped with the cookies and remains valid as long as the cookie is valid. The cookie is returned prior to user authentication but only after a successfull authentication it is mapped to a particular user.

Below is a pictorial representation of how authentication takes place.

<img src="./media/authentication.png"  width="100%" />

### 3.4 How the extension authenticates the users?

Initially, I wasn't sending `X-Csrf-Token` header in the `/login` request as I was unaware that it needs to be sent as well. What contributed even more in this doubt was, that HackerRank was authenticating the user and returning an **invalid** token instead of rejecting the request altogether.

Once I figured that `X-Csrf-Token` header is needed, the next challenge was to figure out where this token is embedded in the page. Generally, it's embedded in the form as a hidden field but there was nothing other than the usual stuff. So, I was again stuck for 2-3 days.

I eventually found it in the `meta` tag. I wrote a simple script to scrape it out before initiation user authentication. With this token, cookie, and user credentials, I was getting the valid token back.

### 3.5 Authentication flow in the extension

1. Take user email and password. Demo of it can be seen in the GIF at the top.
2. Make a GET request to the `hackerrank.com/auth/login` and scrape the csrf token and get the cookies too.
3. Make a POST request to the `hackerrank.com/rest/auth/login` with email and password in the request body, cookies and `X-Csrf-Token` header set to the csrf token obtained in the 2nd step.
4. Upon successful authentication, a new csrf token is returned.
5. Save the email, cookies and the newly generated csrf token locally.

Tokens and cookies will be read from the file system to make a request to the protected routes.

<img src="./media/extension.png"  width="100%" />

## 4. Where does the user data go?

Here, user data involves the user cookies, tokens, and the code files of the challenges that the user has attempted. Everything is strored in the `hackerrank` folder which is located at `$HOME/.config` in Linux/Mac OS and under `<drivename>/Users/<username>/AppData` in the Windows OS.

Structure of the hackerrank folder.

```
├── .hackerrankrc
├── users
   ├── <user1>
      ├── solutions
         ├── <track1>
            ├── <challenge1>
            ├── <challenge2>
            ├── <challenge3>
         ├── <track2>
            ├── <challenge1>
            ├── <challenge2>
         ├── <track3>
            ├── <challenge1>
            ├── <challenge2>
            ├── <challenge3>
            ├── <challenge4>
   ├── <user2>
      ├── solutions
         ├── <track1>
            ├── <challenge1>
         ├── <track2>
            ├── <challenge1>
            ├── <challenge2>
   ├── ... and so on
```

### 4.1 What does .hackerrankrc file do?

This file stores the email, token, and cookie of the currently logged in user. This file is read when a call to the protected route is made.

A new login of a different user would result in rewrite of this file with new set of tokens and cookies. The contents of `.hackerrankrc` indicates the currently logged in user.

```
EMAIL=<user email>
HACKERRANK_COOKIE=<user cookie>
CSRF_TOKEN=<csrf_token>
```

### 4.2 Where is the solution code being saved?

For every logged in user, a new folder is created inside the `hackerrank/users` and the name of the folder is the user's email id. Every user folder has a subfolder `solutions` which contains all the code solutions. Each challenge belongs to a track (category). The solution for a challenge is saved inside the track folder to which the challenge belongs to.

![HackerRank Folder](./media/userdata-folder.png)

If another user signs in, a new folder will be created with it's name as user's email id. All the subfolders will follow the same pattern as above.

![Multiple Users](./media/multiple-users.png)

## 5. Release Notes

### 5.1 Version 0.1.0

- **Release Date**: 2nd Nov, 2023
- **Summary**: MVP is ready and permission for the major release is pending from Hackrrank. Comes with features like user sign in, challenge rendering, run and submit code, and test cases report.

### 5.2 Features

1. User Sign: As of now, only email and password based authentication is supported.
2. Challenges: Challenges are being rendered
3. Run and Submit solution: Allows the user to see what test cases are failing.
4. Multiple languages support: Allows the user to code in any of the language.
5. Save code locally

## 6. Future Ideas

1. See past submissions on a challenge
2. Cookies is a critical user data and should be saved with care. Storing it in encrypted form would be better.
3. Add support for user to overwrite the default location of code solutions
4. Add support for choosing the default language for challenges
5. Add timer for each each challenge allowing the user to practice under time constraint

## 7. How to contribute?

Thank you for considering contributing to HackerRank + VS Code! We welcome your contributions and support in making this project better.

Contributions are welcome in the form of bug reports, feature requests, code changes, documentation updates, and more. To get started, please follow these steps:

1. **Create an Issue:**

   - If you find a bug or have a feature request, please create an issue.
   - Provide as much detail as possible, including the version of the project where you encountered the issue, your operating system, and steps to reproduce the problem.

2. **Fork the Repository:**

   - If you plan to make code contributions, fork the repository to your GitHub account.

3. **Make Changes:**

   - Create a new branch for your changes: `git checkout -b feature/your-feature` or `fix/your-fix`.
   - Make your changes, ensuring that your code follows the project's coding guidelines and standards.

4. **Test Your Changes:**

   - Ensure that your changes work as expected and do not introduce new issues.

5. **Submit a Pull Request:**

   - When you're ready to submit your changes, create a pull request from your fork to the main repository's `master` branch (or the relevant target branch).
   - In the pull request, provide a clear description of your changes and reference any related issues.

6. **Code Review:**

   - Your pull request will be reviewed by project maintainers. Please be responsive to any feedback or requested changes.

7. **Merge and Release:**
   - Once your changes are approved, they will be merged into the project. Your contribution will be included in the next release.

### 8. References

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Cross Site Request Forgery](https://owasp.org/www-community/attacks/csrf)
- [HTTP Headers](https://owasp.org/www-community/attacks/csrf)
- HackerRank platform: I inspected HackerRank's source code and network calls for hours
