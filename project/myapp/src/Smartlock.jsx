import { Button } from 'react-bootstrap';
import { getAssetPath } from './config';

function Smartlock() {
  return (
    <section className="smartlock-section">
      <div className="smartlock-text">
        <h2>Smart Locks for Modern Living</h2>
        <p>
          Experience the next level of home security with our advanced
          smart lock systems. Easy to install, secure to use, and designed
          perfectly for your modern lifestyle.
        </p>
        <Button className="smart-btn">Book Now</Button>
      </div>

      {/* Floating image (images.png) */}
      <img
        src={getAssetPath("/assets/images.png")}
        alt="Smart Lock Device"
        className="smart-float-img"
      />
    </section>
  )
} export default Smartlock;