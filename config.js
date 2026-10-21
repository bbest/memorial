// edit this file to personalize the memorial site ----
window.MEMORIAL = {
  // who is being remembered
  names    : "Brooks & Carolyn Otis",
  dates    : "",   // e.g. "Brooks 19xx – 20xx  ·  Carolyn 19xx – 20xx"
  epigraph : "With love, and in celebration of two lives full of music, gardens, family and friends.",

  // large photo at the top
  hero: { src: "img/historical/full/20.jpg", alt: "Brooks and Carolyn wearing leis in front of a waterfall" },

  // the three main links
  links: {
    historical_photos : "https://drive.google.com/drive/folders/1q-qLDTl_PdCCML2WOz1p3ADrh_VsuGz2?usp=sharing",
    memorial_photos   : "https://beausaundersphotographer.pixieset.com/brooksandcarolynotismemorialcelebration/",
    video             : "" },  // paste the video link here; the button stays hidden until then

  // photos in the viewer: list of {src, thumb, caption} (regenerate with bin/build_photos.py)
  photos_json: "img/historical/photos.json",

  // guestbook (see README.md for the 5-minute Google Form setup) ----
  guestbook: {
    // form "formResponse" url, e.g. https://docs.google.com/forms/d/e/XXXX/formResponse
    form_action   : "",
    // entry ids from the form's pre-filled link
    entry_name    : "entry.000000001",
    entry_message : "entry.000000002",
    // responses sheet published as csv (File > Share > Publish to web > CSV)
    sheet_csv     : "" }
};
