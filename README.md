# Hackerrank in VS Code 🤝

### Solve Hackerrank challenges from VS Code itself!

![Static Badge](https://img.shields.io/badge/BUILT_FOR-HACKERRANK-%2301ac4b?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/BUILT_WITH-LOVE-orange?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/STATUS-SUCCESS-blue?style=for-the-badge)

## Overview

This project was an attempt to bring Hackerrrank into our good old VS Code as an extension. This extension allows us to leverage the in-built debugging tools, version control system, and infinite customizability of VS Code.

Hackerrank does not come with debugging tools and neither has direct integration with Github for version control. Snippet support is not very flexible. Most of the developers are much more adept at VS Code and would rather prefer coding here than on the hackerrank platform. This is where this extension comes in!

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

3. Press 'F5' to start the debugger. A new VS Code window will open with the extension running.

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

To understand why this project is failing, some knowledge of how Hackerrank works is necessary.

## How am I getting user cookies? (Failing)

I thought I would sniff all the necessary cookies and tokens to forge a fake request to authenticate the user. Upon successful authentication, I would store the necessary cookies and tokens locally in the `$HOME/.config/hackerrank/.hackerrankrc` file. For any protected requests, I would read these cookies from the file system and send them. If the cookie expires, the auth flow will be initiated again.

This approach is called a CSRF (Cross-Site Request Forgery) Attack. When I started this project, I was unaware that what I was doing was a well-known attack. After building everything, I realized Hackerrank has a security mechanism in place to prevent this, which is the usage of `Anti-CSRF` tokens because of which this project seems to be failing.

After an inspection of a few hours, I understood that Hackerrank sends three cookies `_hrank_session`, `hackerrank_mixpanel_token`, and `hrc_l_i` and an `Anti-CSRF token` to the browser on the login page. When the user signs in, these cookies and the token along with user credentials are sent to the server for authentication.

Initially, I did not know `Anti-CSRF token` needed to be sent as well. So, I was just sending cookies and user credentials and getting the `X-Csrf-Token` token back. I happily saved the cookies and token thinking I cracked it. Later, I realized that these cookies and tokens are not getting accepted and I am unable to request to the protected routes like `\compile_tests`. Hackerrank intentionally sends an invalid token when there's a problem with the request. Smart trick.

After some more hacking, I understood that they were using `Anti-CSRF` tokens to prevent what I was trying to do. So, I thought, why not scrape this `Anti-CSRF` token? These tokens are generally embedded in the forms, cookies, or somewhere on the page. It took me days to find where this token is but I eventually did.

Cookie, CSRF Token, and Email are being stored in the `.hackerrankrc` file as per the [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html). User credentials never leave the user's system.

<img width="30%" src="https://media.makeameme.org/created/gimme-that-cookie.jpg">
