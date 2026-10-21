// High-Performance Client-Side Animated Vector Defense Engine
// Renders 60fps step-by-step vector animations onto an HTML5 Canvas completely offline

export interface AnimatedTechnique {
  id: string;
  title: string;
  titleHi: string;
  techniqueName: string;
  techniqueNameHi: string;
  category: string;
  categoryHi: string;
  durationSec: number;
  targetPoint: string;
  targetPointHi: string;
  keyRule: string;
  keyRuleHi: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    titleHi: string;
    desc: string;
    descHi: string;
    timeRange: [number, number]; // [startProgress, endProgress]
  }>;
}

export const ANIMATED_TECHNIQUES: AnimatedTechnique[] = [
  {
    id: 'wrist_escape',
    title: 'Wrist Grab Break: Thumb Gap Twist',
    titleHi: 'कलाई छुड़ाने का 1 सेकंड का दांव (अंगूठे का जोड़)',
    techniqueName: 'Rotational Leverage Escape',
    techniqueNameHi: 'अंगूठे के खाली हिस्से से घुमाव',
    category: 'Core Street Escapes',
    categoryHi: 'सड़क पर अचानक पकड़',
    durationSec: 5,
    targetPoint: 'Attacker Thumb Opening (Weakest Joint)',
    targetPointHi: 'हमलावर के अंगूठे का खुला जोड़',
    keyRule: 'Never pull backward in a tug of war. Rotate wrist inward toward the thumb gap and jerk elbow to ribs.',
    keyRuleHi: 'हाथ पीछे खींचने की गलती न करें। कलाई को अंगूठे की तरफ घुमाएं और कोहनी को अपनी छाती से लगाएं।',
    steps: [
      {
        stepNumber: 1,
        title: 'Drop Your Stance',
        titleHi: 'वजन नीचे करें (सख्त बेस बनाएं)',
        desc: 'Slightly bend your knees to lower your center of gravity so you cannot be pulled off-balance.',
        descHi: 'घुटने थोड़े मोड़ें ताकि हमलावर आपको खींचकर असंतुलित न कर सके।',
        timeRange: [0, 0.3],
      },
      {
        stepNumber: 2,
        title: 'Rotate Toward Thumb Gap',
        titleHi: 'अंगूठे के गैप की तरफ कलाई घुमाएं',
        desc: 'Rotate your wrist sharply inward where attacker’s fingers and thumb meet (the only weak opening).',
        descHi: 'अपनी कलाई को हमलावर के अंगूठे के खाली हिस्से की तरफ तेजी से घुमाएं।',
        timeRange: [0.3, 0.65],
      },
      {
        stepNumber: 3,
        title: 'Elbow Snap & Sprint',
        titleHi: 'कोहनी झटका देकर छुड़ाएं व भागें',
        desc: 'Jerk your elbow straight back into your own ribs. Grip instantly snaps open. Sprint to safety.',
        descHi: 'अपनी कोहनी को तेजी से अपनी पसलियों की तरफ खींचें। पकड़ तुरंत टूट जाएगी।',
        timeRange: [0.65, 1.0],
      },
    ],
  },
  {
    id: 'palm_strike',
    title: 'Palm Heel Strike: Nose & Chin Snap',
    titleHi: 'हथेली का जोरदार प्रहार: नाक और जबड़े पर',
    techniqueName: 'Open Palm Heel Impact',
    techniqueNameHi: 'कड़े पाम हील से प्रहार',
    category: 'Vulnerable Counters',
    categoryHi: 'कमजोर अंगों पर सीधा वार',
    durationSec: 4.5,
    targetPoint: 'Nose Cartilage & Chin (Eyes tear instantly)',
    targetPointHi: 'नाक की नरम हड्डी और जबड़ा',
    keyRule: 'Never punch with knuckles—female finger bones can break. Always strike with the dense bottom heel of your palm.',
    keyRuleHi: 'मुक्के से कभी न मारें, उंगली टूट सकती है। हमेशा हथेली के निचले कड़े हिस्से से वार करें।',
    steps: [
      {
        stepNumber: 1,
        title: 'Cock Palm at 90°',
        titleHi: 'हथेली 90 डिग्री पर पीछे खींचें',
        desc: 'Pull fingers back tightly. The dense bone at the bottom of your palm becomes a hammer.',
        descHi: 'उंगलियों को पीछे खींचकर हथेली का निचला कड़ा हिस्सा आगे लाएं।',
        timeRange: [0, 0.3],
      },
      {
        stepNumber: 2,
        title: 'Drive Upward at 45°',
        titleHi: 'नीचे से ऊपर 45 डिग्री पर मारें',
        desc: 'Drive hips forward and launch palm heel straight up into the bottom of his nose and jaw.',
        descHi: 'पूरी ताकत से नीचे से ऊपर की तरफ उसकी नाक और जबड़े पर वार करें।',
        timeRange: [0.3, 0.7],
      },
      {
        stepNumber: 3,
        title: 'Disorient & Flee',
        titleHi: 'हमलावर को अंधा कर सुरक्षित निकलें',
        desc: 'Impact triggers watery eyes and blurred vision for 30 seconds. Disengage and run to public area.',
        descHi: 'नाक पर वार से हमलावर की आंखों में पानी आ जाएगा। तुरंत मुड़कर भीड़ की ओर भागें।',
        timeRange: [0.7, 1.0],
      },
    ],
  },
  {
    id: 'bear_hug_rear',
    title: 'Rear Bear Hug: Dead-Weight Drop & Heel Stomp',
    titleHi: 'पीछे से दबोचने पर बचाव: वजन गिराना व एड़ी का वार',
    techniqueName: 'Gravity Drop & Foot Piston',
    techniqueNameHi: 'गुरुत्वाकर्षण व पैर कुचलना',
    category: 'Ambush Releases',
    categoryHi: 'पीछे से अचानक हमला',
    durationSec: 5.5,
    targetPoint: 'Instep / Toes Bone & Solar Plexus',
    targetPointHi: 'पैर के पंजे की हड्डियां और पसलियां',
    keyRule: 'Instantly squat low so attacker cannot lift you, then slam your heel directly onto their toes.',
    keyRuleHi: 'तुरंत घुटने मोड़कर बैठ जाएं ताकि हमलावर उठा न सके, फिर पूरी ताकत से एड़ी उसके पैर पर पटकें।',
    steps: [
      {
        stepNumber: 1,
        title: 'Instant Dead-Weight Drop',
        titleHi: 'तुरंत स्क्वैट में नीचे बैठें',
        desc: 'Drop into a low heavy squat. A dropped body weighs 3x more and locks your center of gravity.',
        descHi: 'तुरंत नीचे बैठ जाएं। बैठे हुए शरीर को उठाना लगभग नामुमकिन होता है।',
        timeRange: [0, 0.35],
      },
      {
        stepNumber: 2,
        title: 'Heel Piston Stomp',
        titleHi: 'एड़ी से पैर के पंजे को कुचलें',
        desc: 'Lift your shoe heel and hammer it downward with full body weight onto his delicate instep bones.',
        descHi: 'अपनी एड़ी को ऊपर उठाकर पूरे वजन के साथ उसके पैर के पंजे पर पटकें।',
        timeRange: [0.35, 0.7],
      },
      {
        stepNumber: 3,
        title: 'Rear Elbow Drive & Exit',
        titleHi: 'पीछे कोहनी मारें और निकलें',
        desc: 'Drive sharp elbow backward into his ribs or gut as grip loosens, spin outward and escape.',
        descHi: 'जैसे ही पकड़ ढीली हो, कोहनी से उसकी पसलियों पर मारें और घूमकर भागें।',
        timeRange: [0.7, 1.0],
      },
    ],
  },
  {
    id: 'front_choke_windmill',
    title: 'Front Choke Escape: Windmill Shrug',
    titleHi: 'सामने से गला दबाने पर बचाव: विंडमिल कंधा दांव',
    techniqueName: 'Shoulder Axis Rotation',
    techniqueNameHi: 'कंधे और बाजू से पकड़ तोड़ना',
    category: 'Core Street Escapes',
    categoryHi: 'सड़क पर अचानक पकड़',
    durationSec: 5,
    targetPoint: 'Attacker Thumb Locks & Trachea Protection',
    targetPointHi: 'सांस की नली की सुरक्षा व कलाई जोड़',
    keyRule: 'Tuck chin to chest immediately to shield your windpipe. Reach one arm straight up and pivot 90°.',
    keyRuleHi: 'ठुड्डी नीचे कर सांस की नली बचाएं। एक हाथ ऊपर कर पूरे शरीर को घुमाते हुए उसकी कलाइयों पर मारें।',
    steps: [
      {
        stepNumber: 1,
        title: 'Tuck Chin & Raise Arm',
        titleHi: 'ठुड्डी सीने से लगाएं, एक हाथ ऊपर उठाएं',
        desc: 'Lock chin down to prevent windpipe collapse. Raise right arm vertically straight to the sky.',
        descHi: 'ठुड्डी दबाने से गर्दन की नसें बचती हैं। दायां हाथ सीधा आसमान की ओर उठाएं।',
        timeRange: [0, 0.35],
      },
      {
        stepNumber: 2,
        title: 'Windmill Pivot Over Wrists',
        titleHi: 'शरीर को 90 डिग्री घुमाएं',
        desc: 'Rotate your entire upper torso across his arms. Leverage pops both hands off your neck effortlessly.',
        descHi: 'पूरे शरीर को उसकी कलाइयों के ऊपर से घुमाएं। दोनों हाथ आसानी से छूट जाएंगे।',
        timeRange: [0.35, 0.75],
      },
      {
        stepNumber: 3,
        title: 'Push Off & Scream',
        titleHi: 'धक्का दें और चिल्लाते हुए भागें',
        desc: 'Shove his chest to create 10 feet of distance and sprint shouting for help.',
        descHi: 'हमलावर को धक्का देकर तुरंत भागें और शोर मचाएं।',
        timeRange: [0.75, 1.0],
      },
    ],
  },
  {
    id: 'hair_grab_peel',
    title: 'Hair Grab Defense: Two-Hand Skull Clamp',
    titleHi: 'बाल पकड़े जाने पर बचाव: हाथ दबाकर उंगली मरोड़ना',
    techniqueName: 'Leverage Neutralization',
    techniqueNameHi: 'बाल खिंचने से रोकना व उंगली मोड़ना',
    category: 'Close Quarters',
    categoryHi: 'बाल पकड़ने पर',
    durationSec: 5,
    targetPoint: 'Attacker Finger Joints & Wrist Compression',
    targetPointHi: 'हमलावर की उंगलियां और कलाई',
    keyRule: 'Never pull away from a hair grab—it rips scalp hair. Clamp his hand tightly to your head first.',
    keyRuleHi: 'बाल छुड़ाने के लिए पीछे न खींचें, बाल उखड़ जाएंगे। पहले दोनों हाथों से उसका हाथ अपने सिर पर कसकर दबाएं।',
    steps: [
      {
        stepNumber: 1,
        title: 'Slam Both Hands to Head',
        titleHi: 'दोनों हाथों से उसका हाथ सिर पर चिपकाएं',
        desc: 'Press both palms over his hand onto your skull. This immediately eliminates all pulling pain.',
        descHi: 'अपने दोनों हाथों से हमलावर के हाथ को अपने सिर से चिपका लें ताकि बाल न खिंचें।',
        timeRange: [0, 0.35],
      },
      {
        stepNumber: 2,
        title: 'Bend Fingers Backward',
        titleHi: 'उसकी उंगलियों को पीछे मोड़ें',
        desc: 'Peel his fingers backward toward his own wrist while stepping forward with your hip.',
        descHi: 'उसकी उंगलियों को पकड़कर उसकी कलाई की तरफ उल्टा मरोड़ें।',
        timeRange: [0.35, 0.7],
      },
      {
        stepNumber: 3,
        title: 'Knee Strike & Break Free',
        titleHi: 'घुटने से वार करें और छूटें',
        desc: 'As he bends forward from pain, drive a knee to his abdomen and sprint.',
        descHi: 'दर्द से झुकते ही घुटने से वार करें और तुरंत भागें।',
        timeRange: [0.7, 1.0],
      },
    ],
  },
  {
    id: 'car_door_defense',
    title: 'Cab / Vehicle Ambush: Side Shield & Groin Knee',
    titleHi: 'कैब या ऑटो में हमला: तिरछा होना व घुटने का प्रहार',
    techniqueName: 'Narrow Profile & Low Strike',
    techniqueNameHi: 'शरीर तिरछा कर बचाव',
    category: 'Transit & Travel',
    categoryHi: 'गाड़ी व सफर में सुरक्षा',
    durationSec: 5.5,
    targetPoint: 'Groin & Door Unlock Lever',
    targetPointHi: 'नाजुक अंग और दरवाजे का लॉक',
    keyRule: 'Turn your shoulders sideways immediately. Facing squarely traps you; turning creates space.',
    keyRuleHi: 'दीवार या सीट से बिल्कुल सीधे न चिपकें। तिरछा होने से आपको घूमने और वार करने की जगह मिलती है।',
    steps: [
      {
        stepNumber: 1,
        title: 'Pivot Shoulders 90°',
        titleHi: 'कंधों को 90 डिग्री तिरछा करें',
        desc: 'Turn sideways to halve your surface area and raise forearms to shield your throat and face.',
        descHi: 'तुरंत तिरछी हो जाएं ताकि आपको दबाया न जा सके, दोनों कोहनियां आगे रखें।',
        timeRange: [0, 0.35],
      },
      {
        stepNumber: 2,
        title: 'Explosive Rear Knee Strike',
        titleHi: 'पीछे के पैर से घुटने का जोरदार वार',
        desc: 'Grab his collar or shoulders for leverage and thrust your rear knee straight up into groin.',
        descHi: 'उसके कपड़े पकड़कर पीछे वाले घुटने से पूरी ताकत से बीच में वार करें।',
        timeRange: [0.35, 0.7],
      },
      {
        stepNumber: 3,
        title: 'Unlock Door & Roll Out',
        titleHi: 'दरवाजा खोलकर बाहर निकलें',
        desc: 'As he recoils, flip door lock or push through opposite side and sprint toward people.',
        descHi: 'हमलावर के पीछे हटते ही दरवाजा खोलें और सड़क की तरफ भागें।',
        timeRange: [0.7, 1.0],
      },
    ],
  },
];

// Canvas Drawing Engine for 60fps Vector Animated Visuals
export function renderDefenseFrame(
  ctx: CanvasRenderingContext2D,
  techniqueId: string,
  progress: number, // 0.0 to 1.0
  width: number,
  height: number,
  showTargetOverlay: boolean = true
) {
  // Clear canvas with dark tactical background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  // Draw grid floor & tactical guidelines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  const horizon = height * 0.78;

  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, horizon);
    ctx.lineTo(x + (x - width / 2) * 0.8, height);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(width, horizon);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Scale coordinates to fit responsive canvas
  const centerX = width * 0.48;
  const floorY = horizon;

  switch (techniqueId) {
    case 'wrist_escape':
      drawWristEscapeAnimation(ctx, centerX, floorY, progress, showTargetOverlay);
      break;
    case 'palm_strike':
      drawPalmStrikeAnimation(ctx, centerX, floorY, progress, showTargetOverlay);
      break;
    case 'bear_hug_rear':
      drawBearHugAnimation(ctx, centerX, floorY, progress, showTargetOverlay);
      break;
    case 'front_choke_windmill':
      drawFrontChokeAnimation(ctx, centerX, floorY, progress, showTargetOverlay);
      break;
    case 'hair_grab_peel':
      drawHairGrabAnimation(ctx, centerX, floorY, progress, showTargetOverlay);
      break;
    case 'car_door_defense':
      drawCarDoorAnimation(ctx, centerX, floorY, progress, showTargetOverlay);
      break;
    default:
      drawWristEscapeAnimation(ctx, centerX, floorY, progress, showTargetOverlay);
  }

  // Draw Time Bar & Phase Badge
  drawHudOverlay(ctx, progress, width, height);
}

// 1. WRIST ESCAPE ANIMATION
function drawWristEscapeAnimation(
  ctx: CanvasRenderingContext2D,
  cx: number,
  fy: number,
  p: number,
  showTarget: boolean
) {
  // Attacker (left, slate-400) vs Woman (right, rose-500)
  const attX = cx - 110;
  const womanX = cx + 80;

  // Phase calculation
  const phase1 = Math.min(1, Math.max(0, (p - 0) / 0.3));
  const phase2 = Math.min(1, Math.max(0, (p - 0.3) / 0.35));
  const phase3 = Math.min(1, Math.max(0, (p - 0.65) / 0.35));

  // Woman posture: knees bend in phase 1, arm rotates in phase 2, snaps back in phase 3
  const womanSquat = phase1 * 12;
  const armRotAngle = phase2 * Math.PI * 0.55;
  const snapBackX = phase3 * 65;

  // Draw Attacker
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Attacker Head
  ctx.beginPath();
  ctx.arc(attX, fy - 180, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#475569';
  ctx.fill();
  ctx.stroke();

  // Attacker Torso & Legs
  ctx.beginPath();
  ctx.moveTo(attX, fy - 160);
  ctx.lineTo(attX + 10, fy - 90);
  // Legs
  ctx.lineTo(attX - 15, fy);
  ctx.moveTo(attX + 10, fy - 90);
  ctx.lineTo(attX + 30, fy);
  ctx.stroke();

  // Attacker Gripping Arm reaching toward woman's wrist
  const gripPointX = cx + (phase3 > 0.5 ? -40 * (1 - phase3) : 0);
  const gripPointY = fy - 110;

  ctx.beginPath();
  ctx.moveTo(attX + 10, fy - 150);
  ctx.lineTo(gripPointX - 10, gripPointY);
  ctx.stroke();

  // Draw Attacker Hand
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(gripPointX, gripPointY, 8, 0, Math.PI * 2);
  ctx.fill();

  // Draw Woman (Defender)
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 7;

  // Woman Head with Hair pony
  const wHeadY = fy - 170 + womanSquat;
  ctx.beginPath();
  ctx.arc(womanX + snapBackX * 0.4, wHeadY, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#e11d48';
  ctx.fill();
  ctx.stroke();

  // Woman Torso
  const wPelvisY = fy - 85 + womanSquat;
  const wPelvisX = womanX + snapBackX * 0.4;
  ctx.beginPath();
  ctx.moveTo(womanX + snapBackX * 0.4, wHeadY + 18);
  ctx.lineTo(wPelvisX, wPelvisY);
  // Legs (Sturdy Base)
  ctx.lineTo(wPelvisX - 25, fy);
  ctx.moveTo(wPelvisX, wPelvisY);
  ctx.lineTo(wPelvisX + 35 + phase3 * 20, fy);
  ctx.stroke();

  // Woman Defender Arm
  const wShoulderX = womanX + snapBackX * 0.4 - 5;
  const wShoulderY = wHeadY + 28;
  const wElbowX = phase3 > 0 ? wShoulderX + 15 : wShoulderX - 25;
  const wElbowY = wShoulderY + 30;

  const wWristX = phase3 > 0.3 ? wShoulderX + 25 : gripPointX + 5;
  const wWristY = phase3 > 0.3 ? wShoulderY + 20 : gripPointY;

  ctx.beginPath();
  ctx.moveTo(wShoulderX, wShoulderY);
  ctx.lineTo(wElbowX, wElbowY);
  ctx.lineTo(wWristX, wWristY);
  ctx.stroke();

  // Rotational Force Arrow during Phase 2
  if (phase2 > 0.1 && phase3 === 0) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(gripPointX, gripPointY, 26, -Math.PI * 0.4, armRotAngle - Math.PI * 0.4);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(gripPointX + 24 * Math.cos(armRotAngle - Math.PI * 0.4), gripPointY + 24 * Math.sin(armRotAngle - Math.PI * 0.4), 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Snap & Disengage Spark during Phase 3
  if (phase3 > 0.05 && phase3 < 0.6) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const r1 = 12 * phase3 * 2;
      const r2 = 28 * phase3 * 2;
      ctx.beginPath();
      ctx.moveTo(gripPointX + Math.cos(angle) * r1, gripPointY + Math.sin(angle) * r1);
      ctx.lineTo(gripPointX + Math.cos(angle) * r2, gripPointY + Math.sin(angle) * r2);
      ctx.stroke();
    }
  }

  // Target Indicator
  if (showTarget) {
    drawTargetGlow(ctx, gripPointX, gripPointY, 'THUMB GAP (WEAK POINT)');
  }
}

// 2. PALM STRIKE ANIMATION
function drawPalmStrikeAnimation(
  ctx: CanvasRenderingContext2D,
  cx: number,
  fy: number,
  p: number,
  showTarget: boolean
) {
  const attX = cx + 80;
  const womanX = cx - 70;

  const phase1 = Math.min(1, Math.max(0, (p - 0) / 0.3));
  const phase2 = Math.min(1, Math.max(0, (p - 0.3) / 0.4));
  const phase3 = Math.min(1, Math.max(0, (p - 0.7) / 0.3));

  // Attacker Head (Target)
  const attHeadY = fy - 180 + (phase2 > 0.5 ? -15 * (phase2 - 0.5) : 0);
  const attStumbleX = phase2 > 0.5 ? 45 * (phase2 - 0.5) : (phase3 > 0 ? 30 : 0);

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(attX + attStumbleX, attHeadY, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#475569';
  ctx.fill();
  ctx.stroke();

  // Attacker Body
  ctx.beginPath();
  ctx.moveTo(attX + attStumbleX, attHeadY + 22);
  ctx.lineTo(attX + attStumbleX + 10, fy - 80);
  ctx.lineTo(attX + attStumbleX - 10, fy);
  ctx.moveTo(attX + attStumbleX + 10, fy - 80);
  ctx.lineTo(attX + attStumbleX + 30, fy);
  ctx.stroke();

  // Woman Striking Figure
  const womanLungeX = phase2 * 35 - phase3 * 50;
  const wHeadX = womanX + womanLungeX;
  const wHeadY = fy - 170;

  ctx.strokeStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(wHeadX, wHeadY, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#e11d48';
  ctx.fill();
  ctx.stroke();

  // Woman Torso & Lunge Legs
  ctx.beginPath();
  ctx.moveTo(wHeadX, wHeadY + 18);
  ctx.lineTo(wHeadX - 5, fy - 85);
  ctx.lineTo(wHeadX + 45, fy);
  ctx.moveTo(wHeadX - 5, fy - 85);
  ctx.lineTo(wHeadX - 35, fy);
  ctx.stroke();

  // Striking Palm Arm
  const wShoulderX = wHeadX + 12;
  const wShoulderY = wHeadY + 28;

  let palmX = wShoulderX + 20;
  let palmY = wShoulderY + 25;

  if (phase1 > 0 && phase2 === 0) {
    // Cocking back
    palmX = wShoulderX - 25 * phase1;
    palmY = wShoulderY + 30;
  } else if (phase2 > 0 && phase3 === 0) {
    // Explosive forward-upward drive into attacker chin
    palmX = wShoulderX + (attX - wShoulderX - 10) * phase2;
    palmY = wShoulderY + 20 - (wShoulderY + 20 - (attHeadY + 10)) * phase2;
  } else if (phase3 > 0) {
    // Disengage backwards
    palmX = wShoulderX + 15;
    palmY = wShoulderY + 15;
  }

  // Draw Arm
  ctx.beginPath();
  ctx.moveTo(wShoulderX, wShoulderY);
  ctx.lineTo((wShoulderX + palmX) / 2 - 10, (wShoulderY + palmY) / 2 + 10);
  ctx.lineTo(palmX, palmY);
  ctx.stroke();

  // Open Palm Heel symbol
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.ellipse(palmX, palmY, 7, 12, Math.PI * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Impact Burst
  if (phase2 > 0.6 && phase2 < 0.95) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(attX + attStumbleX - 15, attHeadY + 10, 24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(attX + attStumbleX - 15, attHeadY + 10, 36, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Target Indicator
  if (showTarget) {
    drawTargetGlow(ctx, attX + attStumbleX - 15, attHeadY + 10, 'NOSE & JAW (45° ANGLE)');
  }
}

// 3. REAR BEAR HUG ANIMATION
function drawBearHugAnimation(
  ctx: CanvasRenderingContext2D,
  cx: number,
  fy: number,
  p: number,
  showTarget: boolean
) {
  const phase1 = Math.min(1, Math.max(0, (p - 0) / 0.35));
  const phase2 = Math.min(1, Math.max(0, (p - 0.35) / 0.35));
  const phase3 = Math.min(1, Math.max(0, (p - 0.7) / 0.3));

  const squatDepth = phase1 * 38;
  const stompPhase = phase2;
  const exitSprint = phase3 * 90;

  // Attacker standing right behind woman
  const attX = cx - 35;
  const womanX = cx + 5;

  // Attacker (Behind)
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 8;
  const attHeadY = fy - 190;
  ctx.beginPath();
  ctx.arc(attX, attHeadY, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#475569';
  ctx.fill();
  ctx.stroke();

  // Attacker Torso & Legs
  ctx.beginPath();
  ctx.moveTo(attX, attHeadY + 22);
  ctx.lineTo(attX, fy - 80);
  ctx.lineTo(attX - 25, fy);
  ctx.moveTo(attX, fy - 80);
  ctx.lineTo(attX + 15, fy);
  ctx.stroke();

  // Attacker Arms wrapping around woman
  if (phase3 < 0.2) {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(womanX, fy - 130 + squatDepth * 0.4, 28, -Math.PI * 0.4, Math.PI * 0.7);
    ctx.stroke();
  }

  // Woman (Foreground)
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 7;
  const wHeadY = fy - 170 + squatDepth;
  const wHeadX = womanX + exitSprint;

  ctx.beginPath();
  ctx.arc(wHeadX, wHeadY, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#e11d48';
  ctx.fill();
  ctx.stroke();

  // Woman Torso in Deep Squat Base
  const wPelvisY = fy - 75 + squatDepth;
  ctx.beginPath();
  ctx.moveTo(wHeadX, wHeadY + 18);
  ctx.lineTo(wHeadX, wPelvisY);
  ctx.stroke();

  // Legs: Deep wide squat
  ctx.beginPath();
  ctx.moveTo(wHeadX, wPelvisY);
  ctx.lineTo(wHeadX + 35, fy - squatDepth * 0.3);
  ctx.lineTo(wHeadX + 35, fy);

  // Stomping Heel Leg
  const heelLiftY = stompPhase > 0 && stompPhase < 0.5 ? stompPhase * 40 : (1 - stompPhase) * 40;
  ctx.moveTo(wHeadX, wPelvisY);
  ctx.lineTo(wHeadX - 20, fy - 25 - heelLiftY);
  ctx.lineTo(attX + 10, fy - heelLiftY * 0.2);
  ctx.stroke();

  // Heel Impact Burst on Attacker Foot
  if (stompPhase > 0.45 && stompPhase < 0.75) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(attX + 10, fy - 4, 18, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Downward Force Arrow during Phase 1
  if (phase1 > 0.2 && phase2 === 0) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(wHeadX + 30, wHeadY - 10);
    ctx.lineTo(wHeadX + 30, wHeadY + 40);
    ctx.stroke();
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(wHeadX + 22, wHeadY + 30);
    ctx.lineTo(wHeadX + 30, wHeadY + 45);
    ctx.lineTo(wHeadX + 38, wHeadY + 30);
    ctx.stroke();
  }

  if (showTarget) {
    drawTargetGlow(ctx, attX + 10, fy - 8, 'INSTEP TOES (STOMP)');
  }
}

// 4. FRONT CHOKE WINDMILL ANIMATION
function drawFrontChokeAnimation(
  ctx: CanvasRenderingContext2D,
  cx: number,
  fy: number,
  p: number,
  showTarget: boolean
) {
  const phase1 = Math.min(1, Math.max(0, (p - 0) / 0.35));
  const phase2 = Math.min(1, Math.max(0, (p - 0.35) / 0.4));
  const phase3 = Math.min(1, Math.max(0, (p - 0.75) / 0.25));

  const attX = cx - 85;
  const womanX = cx + 65;

  // Attacker
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(attX, fy - 180, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#475569';
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(attX, fy - 158);
  ctx.lineTo(attX, fy - 80);
  ctx.lineTo(attX - 25, fy);
  ctx.moveTo(attX, fy - 80);
  ctx.lineTo(attX + 20, fy);
  ctx.stroke();

  // Attacker hands choking neck
  const chokeY = fy - 150;
  const handsPopped = phase2 > 0.5 ? (phase2 - 0.5) * 60 : 0;

  ctx.beginPath();
  ctx.moveTo(attX, fy - 145);
  ctx.lineTo(womanX - 25 - handsPopped, chokeY);
  ctx.stroke();

  // Woman
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 7;
  const chinTuck = phase1 * 8;
  const wHeadY = fy - 170 + chinTuck;
  const pivotX = phase2 * 45;

  ctx.beginPath();
  ctx.arc(womanX + pivotX, wHeadY, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#e11d48';
  ctx.fill();
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(womanX + pivotX, wHeadY + 18);
  ctx.lineTo(womanX + pivotX, fy - 85);
  ctx.lineTo(womanX + pivotX - 20, fy);
  ctx.moveTo(womanX + pivotX, fy - 85);
  ctx.lineTo(womanX + pivotX + 30, fy);
  ctx.stroke();

  // Windmill Arm: Shoots up in Phase 1, Pivots across wrists in Phase 2
  const armRaise = phase1 * 80;
  const armPivot = phase2 * Math.PI * 0.7;

  const wShoulderX = womanX + pivotX - 10;
  const wShoulderY = wHeadY + 25;

  let handX = wShoulderX;
  let handY = wShoulderY - armRaise;

  if (phase2 > 0) {
    handX = wShoulderX - Math.sin(armPivot) * 85;
    handY = wShoulderY - Math.cos(armPivot) * 85;
  }

  ctx.strokeStyle = '#fb7185';
  ctx.beginPath();
  ctx.moveTo(wShoulderX, wShoulderY);
  ctx.lineTo((wShoulderX + handX) / 2, (wShoulderY + handY) / 2);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  // Windmill Arc Guide
  if (phase1 > 0.4 && phase2 < 0.6) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(wShoulderX, wShoulderY, 80, -Math.PI * 0.5, -Math.PI * 0.9, true);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (showTarget) {
    drawTargetGlow(ctx, womanX - 20, chokeY, 'CHIN TUCK (SHIELD TRACHEA)');
  }
}

// 5. HAIR GRAB ANIMATION
function drawHairGrabAnimation(
  ctx: CanvasRenderingContext2D,
  cx: number,
  fy: number,
  p: number,
  showTarget: boolean
) {
  const phase1 = Math.min(1, Math.max(0, (p - 0) / 0.35));
  const phase2 = Math.min(1, Math.max(0, (p - 0.35) / 0.35));
  const phase3 = Math.min(1, Math.max(0, (p - 0.7) / 0.3));

  const attX = cx + 80;
  const womanX = cx - 60;

  // Attacker
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 7;
  const attPainBend = phase2 * 35;
  ctx.beginPath();
  ctx.arc(attX - attPainBend * 0.5, fy - 180 + attPainBend, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#475569';
  ctx.fill();
  ctx.stroke();

  // Attacker Arm reaching to woman hair
  ctx.beginPath();
  ctx.moveTo(attX - attPainBend * 0.5, fy - 158 + attPainBend);
  ctx.lineTo(womanX + 22, fy - 170 + attPainBend * 0.3);
  ctx.stroke();

  // Woman
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 7;
  const wHeadY = fy - 170;
  ctx.beginPath();
  ctx.arc(womanX, wHeadY, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#e11d48';
  ctx.fill();
  ctx.stroke();

  // Ponytail hair
  ctx.strokeStyle = '#be123c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(womanX + 16, wHeadY);
  ctx.quadraticCurveTo(womanX + 26, wHeadY + 5, womanX + 22, wHeadY + 25);
  ctx.stroke();

  // Woman body
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(womanX, wHeadY + 18);
  ctx.lineTo(womanX, fy - 85);
  ctx.lineTo(womanX - 25, fy);
  ctx.moveTo(womanX, fy - 85);
  ctx.lineTo(womanX + 30, fy);
  ctx.stroke();

  // Woman Hands clamping attacker's wrist against skull (Phase 1 & 2)
  if (phase1 > 0.2) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(womanX + 18, wHeadY, 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (showTarget) {
    drawTargetGlow(ctx, womanX + 20, wHeadY - 5, 'TWO-HAND CLAMP ON SKULL');
  }
}

// 6. CAR / TRANSIT AMBUSH ANIMATION
function drawCarDoorAnimation(
  ctx: CanvasRenderingContext2D,
  cx: number,
  fy: number,
  p: number,
  showTarget: boolean
) {
  const phase1 = Math.min(1, Math.max(0, (p - 0) / 0.35));
  const phase2 = Math.min(1, Math.max(0, (p - 0.35) / 0.35));
  const phase3 = Math.min(1, Math.max(0, (p - 0.7) / 0.3));

  // Car Door Frame & Window
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.strokeRect(cx - 160, fy - 220, 140, 220);

  // Door Handle / Lock
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(cx - 150, fy - 110, 16, 8);

  // Attacker blocking opening
  const attX = cx + 60;
  const attBackoff = phase2 > 0.4 ? (phase2 - 0.4) * 60 : (phase3 > 0 ? 40 : 0);

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(attX + attBackoff, fy - 180, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#475569';
  ctx.fill();
  ctx.stroke();

  // Woman
  const womanX = cx - 50 + phase3 * 120;
  const womanProfileWidth = 24 - phase1 * 14; // Narrow profile

  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.ellipse(womanX, fy - 170, womanProfileWidth / 2, 18, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e11d48';
  ctx.fill();
  ctx.stroke();

  // Woman Knee Drive (Phase 2)
  const kneeThrust = phase2 > 0 && phase2 < 0.8 ? Math.sin(phase2 * Math.PI) * 45 : 0;
  ctx.beginPath();
  ctx.moveTo(womanX, fy - 85);
  ctx.lineTo(womanX + kneeThrust, fy - 70);
  ctx.stroke();

  if (phase2 > 0.3 && phase2 < 0.7) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(attX - 10, fy - 70, 20, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (showTarget) {
    drawTargetGlow(ctx, attX - 10, fy - 70, 'GROIN KNEE STRIKE');
  }
}

// Glowing target marker
function drawTargetGlow(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) {
  ctx.save();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();

  // Label bubble
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1;
  const textWidth = ctx.measureText(label).width;
  ctx.fillRect(x - textWidth / 2 - 8, y - 36, textWidth + 16, 20);
  ctx.strokeRect(x - textWidth / 2 - 8, y - 36, textWidth + 16, 20);

  ctx.fillStyle = '#fecaca';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y - 22);
  ctx.restore();
}

// Top HUD: Progress & Current Step Banner
function drawHudOverlay(
  ctx: CanvasRenderingContext2D,
  p: number,
  width: number,
  height: number
) {
  // Top progress bar
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, width, 4);
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(0, 0, width * p, 4);

  // Subtle bottom watermark
  ctx.fillStyle = '#475569';
  ctx.font = '9px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('AEGIS 60FPS VECTOR DEFENSE SIMULATOR · OFFLINE STANDALONE', 16, height - 14);
}
