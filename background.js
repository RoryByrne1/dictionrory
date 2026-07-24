const api = typeof browser !== "undefined" ? browser : chrome;

api.contextMenus.create({
    id: "define-word",
    title: "define \"%s\"",
    contexts: ["selection"]
});

api.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "define-word") {
        const word = info.selectionText;

        console.log(word);

        // save word for the popup
        api.storage.local.set({
            selectedWord: word
        });

        // open popup in a small window
        api.windows.create({
            url: api.runtime.getURL("popup/define_word.html"),
            type: "popup",
            width: 375,
            height: 500,
            left: 20,
            top: 20
        });
    }
});