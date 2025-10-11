function Smartlock(){
    return(
        <section className="smartlock-section">
            <div className="smartlock-text">
                <h2>Smart Locks for Modern Living</h2>
        <p>
          Experience the next level of home security with our advanced
          smart lock systems. Easy to install, secure to use, and designed
          perfectly for your modern lifestyle.
        </p>
        <button className="smart-btn">Book Now</button>
      </div>

      {/* Floating image (images.png) */}
      <img
        src="http://localhost:5000/assets/images.png"
        alt="Smart Lock Device"
        className="smart-float-img"
      />
    </section>
    ) 
}export default Smartlock;