This file shall contain concepts that I have learned in the process of this rewrite. 
The purpose of this is so I do not get overwhelmed with new ideas, so I can actually complete an iteration without being tempted to start over.
Learn to accept that this bot is flawed and it always will be. Because art is never finished, only abandoned.

- add network error handling to skyblock news
- you should handle 403 (invalid key) and 429 (ratelimit hit)

This is my fetching process for hypixel api
it:
auto retries
handles ratelimit with proper "cooldown" based on what hypixel says
ensure requests to same resources are combined to prevent parallel api requesting
auto parse error code
