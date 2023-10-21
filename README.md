# Hackerrank 🤝 VS Code

### Solve Hackerrank challenges from VS Code itself! 🥳

![Static Badge](https://img.shields.io/badge/BUILT_FOR-HACKERRANK-%2301ac4b?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/BUILT_WITH-LOVE-orange?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/STATUS-FAILING-red?style=for-the-badge)

## Overview

This project was an attempt to bring Hackerrrank into our good old VS Code as an extension. This extension allows us to leverage the in-built debugging tools, version control system, and infinite customizability of VS Code.

Hackerrank does not come with debugging tools and neither has direct integration with Github for version control. Snippet support is not very flexible. Most of the developers are much more adept at VS Code and would rather prefer coding here than on the hackerrank platform. This is where this extension comes in!
<br>

<img src="./media/main.gif" width="90%">

<br>

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

## Known Issues

<details>
<summary>SEVERE: Run and Submit functionality is breaking</summary>

1. Description: The POST request on the `/compile_tests` route of Hackerrank APIs expects the `X-Csrf-Token` and `Cookie` header. The tokens generated on user authentication are not being accepted. However, the tokens and cookies from the browser are getting accepted. I guess, Hackerrank is returning an invalid token on user authentication.
2. Things I've tried:
   - Using a headless browser, Puppeteer: In headless mode, I'm not receiving any cookies whatsoever. This is most likely intentional and a security measure.s.
   - Selenium: I suspected that the browser is sending some extra tokens (third-party tokens that I'm not receiving on making a GET call) or info to generate a valid `X-Csrf-Token` token. So, I thought of opening the hackerrank.com/auth/login on a browser and then fetching all the cookies (including third-party ones). This did not work, unfortunately.

</details>

## How it works?

Hackerrank does not provide any out-of-the-box API to access its platform's capabilities. I had to resort to browser inspection tools to identify what calls were being made for which data. This way I figured out the API endpoints, request and response headers, and request and response payload format.

For example, to detect an API endpoint for fetching all the challenges for a specific topic, say Java, here's how I found the endpoint.

1. Open your browser and press F12 to open developer tools. Go to the network tab.

2. Now, open the page for which you want to see network calls. In my case, it's `hackerrank.com/domain/java`.

3. A bunch of network calls will appear. In my case, we are just looking for Fetch/XHR API calls. In the below image, I have set up a filter to show only those requests.

4. This filter shortens our list of network calls. Now, we just need to explore these calls. With some exploration, it becomes clear which call is for what. Here, the '/challenges' endpoint is of interest to us.

5. Upon selecting a particular call, another pain opens which contains details for that particular call. The Header, Payload, Response, and Cookie tabs can tell us the whole anatomy of the call.
<br>
<img src="./media/inspection.png" width="90%"/>

**Enjoy!**
