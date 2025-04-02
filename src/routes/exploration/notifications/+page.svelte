<script lang="ts">
  const onClick = () => {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') {
        new Notification('Hello, World', {
          body: 'this is an example notification'
        });
      }
    });
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      new Notification('See ya, World', {
        body: "Where'd you go?"
      });
    }
  });
</script>

<h1>Notifications</h1>
<button on:click={onClick}>Click Me</button>
