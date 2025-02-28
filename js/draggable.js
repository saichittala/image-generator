document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("draggableModal");

    // Create Resize Handles
    const resizeHandles = {
        left: document.createElement("div"),
        right: document.createElement("div"),
        top: document.createElement("div"),
        bottom: document.createElement("div")
    };

    Object.keys(resizeHandles).forEach((key) => {
        resizeHandles[key].classList.add("resize-handle", key);
        modal.appendChild(resizeHandles[key]);
    });

    let isDragging = false, isResizing = false;
    let startX, startY, startWidth, startHeight;

    // Dragging Logic
    modal.addEventListener("mousedown", (e) => {
        if (e.target.classList.contains("resize-handle")) return;
        isDragging = true;
        startX = e.clientX - modal.offsetLeft;
        startY = e.clientY - modal.offsetTop;
        modal.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            let left = e.clientX - startX;
            let top = e.clientY - startY;

            // Prevent modal from moving out of viewport
            left = Math.max(0, Math.min(window.innerWidth - modal.offsetWidth, left));
            top = Math.max(0, Math.min(window.innerHeight - modal.offsetHeight, top));

            modal.style.left = `${left}px`;
            modal.style.top = `${top}px`;
        } else if (isResizing) {
            if (isResizing === "left" || isResizing === "right") {
                let newWidth = startWidth + (isResizing === "right" ? e.clientX - startX : startX - e.clientX);
                modal.style.width = `${Math.max(150, newWidth)}px`;
            }
            if (isResizing === "top" || isResizing === "bottom") {
                let newHeight = startHeight + (isResizing === "bottom" ? e.clientY - startY : startY - e.clientY);
                modal.style.height = `${Math.max(100, newHeight)}px`;
            }
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        isResizing = false;
        modal.style.cursor = "grab";
    });

    // Resizing Logic
    Object.keys(resizeHandles).forEach((side) => {
        resizeHandles[side].addEventListener("mousedown", (e) => {
            isResizing = side;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = modal.offsetWidth;
            startHeight = modal.offsetHeight;
            e.preventDefault();
        });
    });
});
