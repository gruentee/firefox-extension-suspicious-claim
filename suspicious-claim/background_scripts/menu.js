browser.menus.create({
    id: "classify-selection",
    title: "Classify selected text️",
    contexts: ["selection"],
});

browser.menus.onClicked.addListener((info, tab) => {
    console.log("menu onClicked handler called")
    if (info.menuItemId == "classify-selection") {
        console.log("menu entry clicked")
        console.log(info.selectionText);
    }
});