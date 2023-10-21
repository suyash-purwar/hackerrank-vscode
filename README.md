# Hackerrank 🤝 VS Code (Going beyond 'X-Hiring' header 😉)

### Solve Hackerrank challenges from VS Code itself! 🥳

![Static Badge](https://img.shields.io/badge/BUILT_FOR-HACKERRANK-%2301ac4b?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/BUILT_WITH-LOVE-orange?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/STATUS-FAILING-red?style=for-the-badge)

## Overview

This project was an attempt to bring Hackerrrank into our good old VS Code as an extension. This extension allows us to leverage the in-built debugging tools, version control system, and infinite customizability of VS Code.

Hackerrank does not come with debugging tools and neither has direct integration with Github for version control. Snippet support is not very flexible. Most of the developers are much more adept at VS Code and would rather prefer coding here than on the hackerrank platform. This is where this extension comes in!

> Honestly, I did this so that I can get noticed in a pile of applications they recieve for an intern position. I hope I get to be a part of their cool team.

<br>

<img src="./media/main.gif" width="90%">

## Install

1. Clone the repository locally

```bash
git clone https://github.com/Suyash-Purwar/hackerrank-vscode.git
```

2. Move inside the folder and open VS Code

```bash
cd hackerrank-vscode && code .
```

3. Press 'F5' to start the debugger. A new VS Code will open with the extension running.

## Hackerrank provides an API for developers, right?

Hackerrank does not provide any out-of-the-box API to access its platform's capabilities. I had to resort to browser inspection tools to identify what calls were being made for which data. This way I figured out the API endpoints, request and response headers, and request and response payload format.

For example, to detect an API endpoint for fetching all the challenges for a specific topic, say Java, here's how I found the endpoint.

1. Open your browser and press F12 to open developer tools. Go to the network tab.

2. Now, open the page for which you want to see network calls. In my case, it's `hackerrank.com/domain/java`.

3. A bunch of network calls will appear. In my case, we are just looking for Fetch/XHR API calls. In the below image, I have set up a filter to show only those requests.

4. This filter shortens our list of network calls. Now, we just need to explore these calls. With some exploration, it becomes clear which call is for what. Here, the '/challenges' endpoint is of interest to us.

5. Upon selecting a particular call, another pain opens which contains details for that particular call. The Header, Payload, Response, and Cookie tabs can tell us the whole anatomy of the call.
   <br>

<img src="./media/inspection.png" width="90%"/>

## Why is it failing?

All the requests requiring user authentication are failing. For a user to be authenticated, following is required:

1. `_hrank_session`: This session is receive when a user visits `hackerrank.com`
2. `X-Csrf-Token`: This token is used to prevent Cross-Site Forgery Attack. It is recieve when a user is authenticated (after sign in).

The `/auth/login` route is hit with a user password and email along with `_hrank_session`. Upon successful validation, the `X-Csrf-Token` is recieved.

To replicate this procedure, I'm making a `HEAD` request to the `hackerrank.com` to get the response headers and extracting the `_hrank_session` cookie along with other cookies like `hackerrank_mixpanel_token`. The other cookies are of no interest to us but it doesn't hurt us to send them back either. This would help the platform better understand the user behaviour. For instance, this `hackerrank_mixpanel_token` is associated with an analytics software called [Mixpanel](https://mixpanel.com/).

Once the `_hrank_session` is recieved, a `POST` call goes to the `/auth/login` endpoint with user email, password and cookies obtained from previous request. If the user is valid, the `X-Csrf-Token` is returned. We store these cookies and token on the user's machine in a RC file called `.hackerrankrc` following the [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html).

> Note: HEAD method is just like any other methods like GET, POST, etc. It is used to get the headers in return. It does not return a body.

The requests for running and submission of code are protected. As a result, we are sending the cookies and token in headers.

The POST request on the `/compile_tests` route of Hackerrank APIs expects the `X-Csrf-Token` and `Cookie` header. The tokens generated on user authentication process followed are not being accepted. However, the tokens and cookies from the browser are getting accepted. It seem Hackerrank is returning an invalid token when a sign in is performed outside the browser.

It's wise of the engineers working there but it's a total kill for my project.

Things I've tried:

- Using a headless browser, Puppeteer: In headless mode, I'm not receiving any cookies whatsoever. This is most likely intentional and a security measure.
- Selenium: I suspected that the browser is sending some extra tokens (third-party tokens that I'm not receiving on making a GET call) or info to generate a valid `X-Csrf-Token` token. So, I thought of opening the hackerrank.com/auth/login on a browser and then fetching all the cookies (including third-party ones). This did not work, unfortunately.

GIMME VALID COOKIE!

<img width="30%" src="https://media.makeameme.org/created/gimme-that-cookie.jpg">
