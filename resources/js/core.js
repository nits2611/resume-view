function makeElem(tagName, parentElem, attributes = {})
{
    try
    {
        const elem = document.createElement(tagName);
        for (const [key, value] of Object.entries(attributes))
            elem.setAttribute(key, value);
        parentElem.appendChild(elem);
    }
    catch(e)
    {
        console.error("Caught Error (CSW.JS - makeElem): ", e);
    }
}