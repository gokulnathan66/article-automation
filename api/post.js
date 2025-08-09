const response = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.DEV_TO_API_KEY
    },
    body: JSON.stringify({
      article: {
        title: 'My New Post',
        body_markdown: 'This is the *content* of my new post.',
        published: true,
        tags: ['tag1', 'tag2']
      }
    })
  });
  const data = await response.json();
  console.log(data);
  