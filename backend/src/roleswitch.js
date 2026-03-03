```javascript
// This is a simple button that changes a word on the screen
import React, { useState } from 'react';

function RoleSwitch() {
const [role, setRole] = useState("Student");

return (
<div style={{ textAlign: 'center', padding: '20px' }}>
<h2>You are currently a: {role}</h2>
<button onClick={() => setRole(role === "Student" ? "Tutor" : "Student")}>
Click to Switch Roles
</button>
</div>
);
}

export default RoleSwitch;