
import { BsEnvelope, BsEnvelopeCheck, BsEnvelopeHeart, BsEnvelopeOpen, BsEnvelopePlus, BsEnvelopeSlash } from "react-icons/bs";
import { FaBriefcase, FaBuilding, FaCakeCandles, FaCcMastercard, FaCcPaypal, FaCcVisa, FaChrome, FaEdge, FaFacebook, FaFirefoxBrowser, FaHouse, FaInternetExplorer, FaLinkedin, FaLock, FaOctopusDeploy, FaOpera, FaPlane, FaSafari, FaTwitter, FaUmbrellaBeach, FaUsers, FaYoutube } from "react-icons/fa6";
import { FiActivity, FiAirplay, FiAlertCircle, FiArchive, FiArrowDown, FiArrowUp, FiAtSign, FiAward, FiBarChart2, FiBell, FiBellOff, FiBluetooth, FiBriefcase, FiCast, FiCheck, FiCheckCircle, FiChrome, FiClipboard, FiClock, FiCompass, FiCopy, FiCrosshair, FiDelete, FiDollarSign, FiEdit, FiEye, FiFacebook, FiFigma, FiFileText, FiFramer, FiGitBranch, FiGitCommit, FiGithub, FiGitlab, FiGlobe, FiGrid, FiHelpCircle, FiInstagram, FiLayers, FiLayout, FiLifeBuoy, FiLink, FiLink2, FiLinkedin, FiList, FiLock, FiLogIn, FiMail, FiMapPin, FiMessageSquare, FiMonitor, FiMoon, FiPause, FiPhone, FiPieChart, FiPlusSquare, FiPower, FiRepeat, FiSearch, FiSend, FiSettings, FiShield, FiShoppingBag, FiShoppingCart, FiSliders, FiSmartphone, FiStar, FiSun, FiSunrise, FiSunset, FiTablet, FiTag, FiTrash2, FiTwitter, FiType, FiUmbrella, FiUser, FiUserCheck, FiUserMinus, FiUserPlus, FiUsers, FiX, FiYoutube } from "react-icons/fi";

const getIcon = (name) => {
    switch (name) {
        case "feather-moon":
            return <FiMoon style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-sunrise":
            return <FiSunrise style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-sun":
            return <FiSun style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-users":
            return <FiUsers style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-user":
            return <FiUser style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-user-check":
            return <FiUserCheck style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-user-plus":
            return <FiUserPlus style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-user-minus":
            return <FiUserMinus style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-arrow-up":
            return <FiArrowUp style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-arrow-down":
            return <FiArrowDown style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-at-sign":
            return <FiAtSign style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-globe":
            return <FiGlobe style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-lock":
            return <FiLock style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-settings":
            return <FiSettings style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-smart-phone":
            return <FiSmartphone style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-bell":
            return <FiBell style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-mail":
            return <FiMail style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-repeat":
            return <FiRepeat style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-bell-off":
            return <FiBellOff style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-link-2":
            return <FiLink2 style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-phone":
            return <FiPhone style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-compass":
            return <FiCompass style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-briefcase":
            return <FiBriefcase style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-link":
            return <FiLink style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-map-pin":
            return <FiMapPin style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-type":
            return <FiType style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-dollar-sign":
            return <FiDollarSign style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-eye":
            return <FiEye style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-tag":
            return <FiTag style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-message-square":
            return <FiMessageSquare style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-search":
            return <FiSearch style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-linkedin":
            return <FiLinkedin style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-instagram":
            return <FiInstagram style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-twitter":
            return <FiTwitter style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-facebook":
            return <FiFacebook style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-github":
            return <FiGithub style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-shield":
            return <FiShield style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-log-in":
            return <FiLogIn style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-clipboard":
            return <FiClipboard style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-check":
            return <FiCheck style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-x":
            return <FiX style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-cast":
            return <FiCast  style={{height: '25px', color: '#3870a7', width: '25px'}}style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-activity":
            return <FiActivity style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-check-circle":
            return <FiCheckCircle style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-pie-chart":
            return <FiPieChart style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-plus-square":
            return <FiPlusSquare style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-sunset":
            return <FiSunset style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-power":
            return <FiPower style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-alert-circle":
            return <FiAlertCircle style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-layout":
            return <FiLayout style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-send":
            return <FiSend style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-grid":
            return <FiGrid style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-youtube":
            return <FiYoutube style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-copy":
            return <FiCopy style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-edit":
            return <FiEdit style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-pause":
            return <FiPause style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-star":
            return <FiStar style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-delete":
            return <FiDelete style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-trash-2":
            return <FiTrash2 style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-git-commit":
            return <FiGitCommit style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-airplay":
            return <FiAirplay style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-clock":
            return <FiClock style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-crosshair":
            return <FiCrosshair style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-life-buoy":
            return <FiLifeBuoy style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-git-branch":
            return <FiGitBranch style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-help-circle":
            return <FiHelpCircle style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-archive":
            return <FiArchive style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-award":
            return <FiAward style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-bar-chart-2":
            return <FiBarChart2 style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-shopping-bag":
            return <FiShoppingBag style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-shopping-cart":
            return <FiShoppingCart style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-figma":
            return <FiFigma style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-gitlab":
            return <FiGitlab style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-bluetooth":
            return <FiBluetooth style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-file-text":
            return <FiFileText style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-monitor":
            return <FiMonitor style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-smartphone":
            return <FiSmartphone style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-tablet":
            return <FiTablet style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-layers":
            return <FiLayers style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-list":
            return <FiList style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-umbrella":
            return <FiUmbrella style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-sliders":
            return <FiSliders style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "feather-framer":
            return <FiFramer style={{height: '25px', color: '#3870a7', width: '25px'}} />





        case "fa-chrome":
            return <FaChrome style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-firefox-browser":
            return <FaFirefoxBrowser style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-safari":
            return <FaSafari style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-edge":
            return <FaEdge style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-opera":
            return <FaOpera style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-internet-explorer":
            return <FaInternetExplorer style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-octopus-deploy":
            return <FaOctopusDeploy style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-cc-visa":
            return <FaCcVisa style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-cc-mastercard":
            return <FaCcMastercard style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-cc-paypal":
            return <FaCcPaypal style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-facebook":
            return <FaFacebook style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-twitter":
            return <FaTwitter style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-youtube":
            return <FaYoutube style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-linkedin":
            return <FaLinkedin style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-briefcase":
            return <FaBriefcase style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-home":
            return <FaHouse style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-users":
            return <FaUsers style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-plane":
            return <FaPlane style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-lock":
            return <FaLock style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-umbrella-beach":
            return <FaUmbrellaBeach style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-building":
            return <FaBuilding style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "fa-birthday-cake":
            return <FaCakeCandles  style={{height: '25px', color: '#3870a7', width: '25px'}} />



        case "bi-envelope":
            return <BsEnvelope  style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "bi-envelope-plus":
            return <BsEnvelopePlus  style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "bi-envelope-check":
            return <BsEnvelopeCheck  style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "bi-envelope-open":
            return <BsEnvelopeOpen  style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "bi-envelope-heart":
            return <BsEnvelopeHeart  style={{height: '25px', color: '#3870a7', width: '25px'}} />
        case "bi-envelope-slash":
            return <BsEnvelopeSlash  style={{height: '25px', color: '#3870a7', width: '25px'}} />


        default:
            break;
    }
}
export default getIcon