"""2T Expert E50: original parametric CAD study, millimetres.

This is a newly designed assembly, NOT a scan or a reproduction of a production
engine. It is not a fabrication release. See the included design notes.
Requires CadQuery 2.7.0. STEP solids are the source of the displayed meshes.
"""
import cadquery as cq
import json, math, pathlib, tempfile, zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/models'
OUT.mkdir(parents=True, exist_ok=True)
parts = []
assembly = cq.Assembly(name='E50_original_2T_Expert')
COLORS = {'cast': (0.57,0.59,0.60), 'aluminium': (0.76,0.78,0.79),
          'steel': (0.43,0.46,0.49), 'dark': (0.12,0.14,0.16),
          'rubber': (0.035,0.039,0.041), 'brass': (0.68,0.49,0.20),
          'ceramic': (0.91,0.90,0.85), 'copper': (0.64,0.28,0.10),
          'gasket': (0.27,0.30,0.27)}

def cyl(radius, length, origin=(0,0,0), axis=(0,0,1)):
    return cq.Solid.makeCylinder(radius, length, cq.Vector(*origin), cq.Vector(*axis))

def box(x,y,z,p=(0,0,0)):
    return cq.Workplane('XY').box(x,y,z).val().translate(p)

def ring(ro,ri,length,origin=(0,0,0),axis=(0,0,1)):
    return cyl(ro,length,origin,axis).cut(cyl(ri,length,origin,axis))

def rounded_box(x,y,z,r,p=(0,0,0)):
    return cq.Workplane('XY').box(x,y,z).edges('|Z').fillet(min(r,min(x,y)*.45)).val().translate(p)

def add(pid,label,family,shape,material='steel',explode=(0,0,0),note=''):
    if not shape.isValid():
        raise ValueError('Invalid solid: '+pid)
    if shape.Volume() <= 0:
        raise ValueError('Empty solid: '+pid)
    assembly.add(shape,name=pid,color=cq.Color(*COLORS[material]))
    b = shape.BoundingBox()
    parts.append({'id':pid,'label':label,'family':family,'material':material,
                  'explode':[explode[0]/1000,explode[2]/1000,-explode[1]/1000], 'note':note,
                  'boundsMm':[b.xlen,b.ylen,b.zlen], 'volumeMm3':shape.Volume(),
                  'shape':shape})
    print(f'{len(parts):03d} {pid}: {label}',flush=True)

def holes_z(s,points,r,z0=-100,length=400):
    for x,y in points:
        s=s.cut(cyl(r,length,(x,y,z0)))
    return s

def spring(radius,wire,pitch,height,p=(0,0,0)):
    path=cq.Wire.makeHelix(pitch,height,radius)
    return cq.Workplane('XZ').center(radius,0).circle(wire).sweep(cq.Workplane(obj=path),isFrenet=True).val().translate(p)

def bolt(pid,label,family,axis,start,length,diam,explode):
    x,y,z=start
    sh=cyl(diam/2,length,start,axis)
    head=cq.Workplane('XY').polygon(6,diam*1.72).extrude(diam*.65).val()
    if axis==(1,0,0):head=head.rotate((0,0,0),(0,1,0),90)
    if axis==(0,-1,0):head=head.rotate((0,0,0),(1,0,0),90)
    head=head.translate(start)
    # Machined helical threads are represented by a plain nominal shank.
    add(pid,label,family,sh.fuse(head),'steel',explode,'Filetage nominal ; hélice non modélisée.')

STUDS=[(-27,-26),(27,-26),(-27,26),(27,26)]
CASE_BOLTS=[(43,0),(28,34),(-28,34),(-43,0),(-28,-34),(28,-34)]

# Split aluminium crankcase: bearing seats, crank cavity, cylinder spigot,
# fastener bosses, lower mounting eyes and reed admission passage.
for side,sgn in [('left',-1),('right',1)]:
    x0=-35 if sgn<0 else 0
    s=cyl(48,35,(x0,0,0),(1,0,0))
    top=rounded_box(70,67,35,6,(0,0,33))
    half=box(35,140,140,(-17.5 if sgn<0 else 17.5,0,0))
    s=s.fuse(top.intersect(half))
    for y,z in CASE_BOLTS:
        s=s.fuse(cyl(7,35,(x0,y,z),(1,0,0)))
    for y in [-31,31]:
        s=s.fuse(cyl(9,35,(x0,y,-43),(1,0,0)))
        s=s.cut(cyl(4.2,40,(x0-2,y,-43),(1,0,0)))
    s=s.cut(cyl(40.5,28,(-28 if sgn<0 else 0,0,0),(1,0,0)))
    s=s.cut(cyl(13,50,(x0-5,0,0),(1,0,0)))
    s=s.cut(cyl(23.5,10,(-35 if sgn<0 else 25,0,0),(1,0,0)))
    s=s.cut(cyl(24.1,85,(0,0,0)))
    s=s.cut(box(25,50,23,(0,-37,25)))
    s=holes_z(s,STUDS,3.2,20,45)
    for y,z in CASE_BOLTS:s=s.cut(cyl(3.1,45,(x0-5,y,z),(1,0,0)))
    add('crankcase-'+side,'Demi-carter '+('gauche' if sgn<0 else 'droit'),
        'case-left',s,'cast',(sgn*160,0,-25),'Logement de roulement Ø47 mm ; demi-carter usinable.')

gasket=cyl(48,.45,(-.225,0,0),(1,0,0)).fuse(box(.45,67,35,(0,0,33)))
gasket=gasket.cut(cyl(40.5,1,(-.5,0,0),(1,0,0))).cut(cyl(24.1,85,(0,0,0)))
for y,z in CASE_BOLTS:gasket=gasket.cut(cyl(3.2,2,(-1,y,z),(1,0,0)))
add('case-gasket','Joint de plan de carters','case-left',gasket,'gasket',(-40,0,-30))
for i,(y,z) in enumerate(CASE_BOLTS):
    bolt(f'case-bolt-{i+1}',f'Vis de carter M6 n°{i+1}','case-left',(1,0,0),(-39,y,z),78,6,(-195,0,-25))

# Rolling element bearings (inner/outer race, cage, eight individual balls).
for side,x,sgn in [('left',-34,-1),('right',26,1)]:
    add('bearing-'+side+'-outer','Roulement '+side+' · bague extérieure','crankshaft',ring(23.5,19.5,8,(x,0,0),(1,0,0)),'steel',(sgn*120,0,0))
    add('bearing-'+side+'-inner','Roulement '+side+' · bague intérieure','crankshaft',ring(15.5,10,8,(x,0,0),(1,0,0)),'steel',(sgn*116,0,0))
    cage=ring(18.2,16.8,6,(x+1,0,0),(1,0,0))
    for i in range(8):
        a=i*math.tau/8;y,z=17.5*math.cos(a),17.5*math.sin(a)
        cage=cage.cut(cq.Solid.makeSphere(3.15,cq.Vector(x+4,y,z),angleDegrees1=-90,angleDegrees2=90))
        add(f'bearing-{side}-ball-{i+1}',f'Roulement {side} · bille n°{i+1}','crankshaft',cq.Solid.makeSphere(3,cq.Vector(x+4,y,z),angleDegrees1=-90,angleDegrees2=90),'steel',(sgn*118,0,0))
    add('bearing-'+side+'-cage','Roulement '+side+' · cage','crankshaft',cage,'brass',(sgn*118,0,0))
    add('seal-'+side,'Joint spi '+side,'crankshaft',ring(24,10,4,(x-4 if sgn<0 else x+8,0,0),(1,0,0)),'rubber',(sgn*135,0,0))

# Crank throw and piston location at 60 crank degrees; conrod centres 85 mm.
CR=19.9; LENGTH=85; ANGLE=math.radians(60)
CY=CR*math.sin(ANGLE); CZ=CR*math.cos(ANGLE)
PINZ=CZ+math.sqrt(LENGTH**2-CY**2)
for side,x,sgn in [('left',-20,-1),('right',8,1)]:
    web=cyl(35,12,(x,0,0),(1,0,0))
    web=web.cut(cyl(7,15,(x-1,CY,CZ),(1,0,0)))
    # Balance drillings opposite the crankpin, not aesthetic perforations.
    for y in [-14,14]:web=web.cut(cyl(6.5,15,(x-1,y,-20),(1,0,0)))
    add('crank-web-'+side,'Masse de vilebrequin '+side,'crankshaft',web,'steel',(sgn*75,0,0))
    shaft=cyl(10,36,(-56 if sgn<0 else 20,0,0),(1,0,0))
    shaft=shaft.cut(box(30,3,4,(-46 if sgn<0 else 46,0,9)))
    add('crank-shaft-'+side,'Demi-arbre de vilebrequin '+side,'crankshaft',shaft,'steel',(sgn*90,0,0))
add('crank-pin','Maneton Ø14 mm','crankshaft',cyl(7,40,(-20,CY,CZ),(1,0,0)),'steel',(0,90,-35))
rod=ring(12,9.1,12,(-6,0,0),(1,0,0)).fuse(ring(8,5.2,12,(-6,0,LENGTH),(1,0,0)))
beam=cq.Workplane('YZ').polyline([(-7,8),(-4,LENGTH-7),(4,LENGTH-7),(7,8)]).close().extrude(4,both=True).val()
rod=rod.fuse(beam).cut(box(3,5,LENGTH-28,(0,0,LENGTH/2)))
rod=rod.rotate((0,0,0),(1,0,0),math.degrees(math.asin(CY/LENGTH))).translate((0,CY,CZ))
add('connecting-rod','Bielle · entraxe 85 mm','rod',rod,'steel',(0,50,60))
for i in range(12):
    a=i*math.tau/12
    add(f'big-end-roller-{i+1}',f'Tête de bielle · aiguille n°{i+1}','rod',cyl(1,10,(-5,CY+8*math.cos(a),CZ+8*math.sin(a)),(1,0,0)),'steel',(0,80,-25))
add('small-end-bush','Bague de pied de bielle','rod',ring(5.15,4.02,12,(-6,0,PINZ),(1,0,0)),'brass',(0,45,100))

# Hollow piston with real pin bores, ring grooves and skirt windows.
PB=PINZ-22
piston=cyl(19.98,47,(0,0,PB)).cut(cyl(17.6,43,(0,0,PB-1)))
for x in [-13,13]:piston=piston.fuse(cyl(7.2,6,(x-3,0,PINZ),(1,0,0)))
piston=piston.cut(cyl(4.02,55,(-27,0,PINZ),(1,0,0)))
for z in [PB+39,PB+43]:piston=piston.cut(ring(21,18.9,1.25,(0,0,z)))
for y in [-18,18]:piston=piston.cut(rounded_box(22,10,14,2,(0,y,PB+5)))
add('piston-body','Piston Ø39,96 mm · jupe et gorges','piston',piston,'aluminium',(0,0,190))
for i,z in enumerate([PB+39,PB+43]):
    segment=ring(20.0,19.0,1.15,(0,0,z)).cut(box(1,8,4,(0,20,z)))
    add(f'piston-ring-{i+1}',f'Segment de compression n°{i+1}','piston',segment,'steel',(0,0,220+i*22))
add('wrist-pin','Axe de piston creux Ø8 mm','piston',ring(4,2.4,36,(-18,0,PINZ),(1,0,0)),'steel',(115,0,185))
for sgn in [-1,1]:
    clip=ring(4.7,4.05,.65,(sgn*18,0,PINZ),(1,0,0)).cut(box(2,3,3,(sgn*18,0,PINZ+4)))
    add('pin-clip-'+str(sgn),'Circlip axe '+('gauche' if sgn<0 else 'droit'),'piston',clip,'steel',(sgn*145,0,185))

# Cylinder casting: spigot, base, fins, separate liner and open ports.
# Scavenging channels communicate with the crankcase and liner windows.
body=cyl(29,82,(0,0,49)).fuse(cyl(24,10,(0,0,41)))
body=body.fuse(rounded_box(69,67,7,6,(0,0,52.5)))
for z in range(60,131,7):
    fin=rounded_box(78,73,2.2,8,(0,0,z))
    body=body.fuse(fin)
body=body.cut(cyl(22.5,110,(0,0,35)))
for x in [-25,25]:body=body.cut(box(8,17,51,(x,0,74.5)))
body=body.cut(box(27,52,17,(0,23,88)))
body=holes_z(body,STUDS,3.5,35,110)
add('cylinder-casting','Cylindre · fonderie et ailettes','cylinder',body,'cast',(0,0,290),'Canaux de transfert, sortie échappement et passages de goujons ouverts.')
liner=ring(22.45,20.02,89,(0,0,42))
liner=liner.cut(box(27,28,17,(0,19,88)))
for x in [-20,20]:liner=liner.cut(box(13,17,15,(x,0,96)))
liner=liner.cut(box(17,20,13,(0,-20,99)))
add('cylinder-liner','Chemise · alésage et lumières','cylinder',liner,'steel',(95,0,290),'Alésage 40,04 mm ; diagramme de distribution non validé au banc.')
base=holes_z(rounded_box(69,67,.6,6,(0,0,48.6)),STUDS,3.5)
base=base.cut(cyl(24.1,3,(0,0,47)))
for x in [-25,25]:base=base.cut(box(8,17,3,(x,0,48.6)))
add('base-gasket','Joint d’embase','cylinder',base,'gasket',(0,0,230))
exflange=rounded_box(46,7,32,4,(0,37,88)).cut(cyl(13,12,(0,31,88),(0,1,0)))
for x in [-18,18]:exflange=exflange.cut(cyl(3.1,12,(x,31,88),(0,1,0)))
add('exhaust-flange','Bride de sortie échappement','exhaust',exflange,'cast',(0,95,70))

head=rounded_box(78,73,8,8,(0,0,135))
for z in range(140,164,6):head=head.fuse(rounded_box(75,70,2.2,7,(0,0,z)))
head=head.fuse(cyl(22,28,(0,0,135)))
chamber=cq.Solid.makeSphere(24,cq.Vector(0,0,116),angleDegrees1=-90,angleDegrees2=90)
head=head.cut(chamber).cut(cyl(5.1,60,(0,0,120)))
head=holes_z(head,STUDS,3.6,120,65)
add('cylinder-head','Culasse · chambre de combustion','head',head,'cast',(0,0,390))
add('head-gasket','Joint de culasse annulaire','head',ring(24,20.3,.5,(0,0,131)),'copper',(0,0,350))
for i,(x,y) in enumerate(STUDS):
    add(f'cylinder-stud-{i+1}',f'Goujon cylindre M6 n°{i+1}','cylinder',cyl(3,146,(x,y,29)),'steel',(0,0,180),'Filetage nominal sans hélice ; longueur de conception.')
    nut=cq.Workplane('XY').polygon(6,10.4).circle(3).extrude(5).val().translate((x,y,167))
    add(f'head-nut-{i+1}',f'Écrou de culasse M6 n°{i+1}','head',nut,'steel',(0,0,435))
    add(f'head-washer-{i+1}',f'Rondelle de culasse n°{i+1}','head',ring(6,3.1,1,(x,y,166)),'steel',(0,0,420))

plug=cyl(5,25,(0,0,137)).fuse(cq.Workplane('XY').polygon(6,16).extrude(7).val().translate((0,0,160)))
plug=plug.cut(cyl(2.1,34,(0,0,136)))
add('spark-plug-shell','Bougie · corps métallique','ignition',plug,'steel',(0,0,490))
add('spark-plug-insulator','Bougie · isolant céramique','ignition',ring(4,1.1,39,(0,0,140)),'ceramic',(0,0,510))
add('spark-plug-electrode','Bougie · électrode centrale','ignition',cyl(1,44,(0,0,137)),'steel',(0,0,540))
add('spark-plug-ground','Bougie · électrode de masse','ignition',box(2,5,1.5,(0,2,136)).fuse(box(2,1.5,7,(0,4,139))),'steel',(0,0,490))

# Reed inlet, flexible manifold and independent leaves and stops.
reed=rounded_box(38,10,32,3,(0,-42,25)).cut(box(26,20,20,(0,-42,25)))
reed=reed.fuse(box(27,23,2,(0,-33,14))).fuse(box(27,23,2,(0,-33,36)))
add('reed-cage','Boîte à clapets · cage','reed',reed,'aluminium',(0,-115,10))
for i,z in enumerate([15.3,34.7]):
    add(f'reed-leaf-{i+1}',f'Lamelle de clapet n°{i+1}','reed',box(25,20,.4,(0,-33,z)),'dark',(0,-125,(i*2-1)*25))
    add(f'reed-stop-{i+1}',f'Butée de clapet n°{i+1}','reed',box(25,19,.8,(0,-33,z+(i*2-1)*2.5)),'steel',(0,-145,(i*2-1)*35))
boot=ring(17,12,35,(0,-80,25),(0,1,0)).fuse(rounded_box(38,5,32,3,(0,-47,25)))
boot=boot.cut(cyl(12,45,(0,-85,25),(0,1,0)))
add('intake-boot','Pipe d’admission souple','reed',boot,'rubber',(0,-170,10))

# Carburettor: through venturi, vertical slide, bowl, float, needle and jet.
carb=rounded_box(39,43,44,5,(0,-102,25)).fuse(cyl(15,70,(0,-137,25),(0,1,0))).fuse(ring(14.5,11,31,(0,-102,47)))
carb=carb.cut(cyl(10.5,85,(0,-143,25),(0,1,0))).cut(cyl(11,38,(0,-102,18)))
carb=carb.cut(box(28,32,16,(0,-102,10)))
add('carb-body','Carburateur Ø21 · corps et venturi','carb',carb,'cast',(0,-245,10))
slide=cyl(10.7,23,(0,-102,31)).cut(cyl(1.1,28,(0,-102,29))).cut(box(25,12,7,(0,-97,31)))
add('carb-slide','Boisseau','carb',slide,'aluminium',(0,-245,95))
needle=cq.Solid.makeCone(.65,1,29,cq.Vector(0,-102,14),cq.Vector(0,0,1))
add('carb-needle','Aiguille de dosage','carb',needle,'brass',(30,-245,90))
bowl=rounded_box(37,41,23,4,(0,-102,-5)).cut(rounded_box(31,35,22,3,(0,-102,-2)))
add('carb-bowl','Cuve de carburateur','carb',bowl,'cast',(0,-245,-65))
add('carb-float','Flotteur double','carb',cyl(7,18,(-11,-111,2),(0,1,0)).fuse(cyl(7,18,(11,-111,2),(0,1,0))).fuse(box(25,3,2,(0,-96,9))),'dark',(0,-245,-35))
add('carb-main-jet','Gicleur principal · passage calibré','carb',ring(3,.42,13,(0,-102,2)),'brass',(25,-245,-50),'Diamètre indicatif ; richesse et calibration non validées.')
add('carb-return-spring','Ressort de rappel du boisseau','carb',spring(7,.55,3.2,21,(0,-102,55)),'steel',(0,-245,110))
add('carb-top-cap','Couvercle de boisseau','carb',ring(15,2,4,(0,-102,78)),'aluminium',(0,-245,140))
filtercase=ring(30,26,40,(0,-179,25),(0,1,0)).fuse(cyl(30,3,(0,-182,25),(0,1,0)))
add('air-filter-housing','Boîtier de filtre à air','reed',filtercase,'dark',(0,-330,10))
add('air-filter-media','Élément filtrant','reed',ring(26,13,34,(0,-177,25),(0,1,0)),'gasket',(0,-365,10))

# Magneto: separate flywheel, stator core and six windings.
rotor=ring(39,32,23,(-68,0,0),(1,0,0)).fuse(ring(32,10.2,4,(-49,0,0),(1,0,0)))
for a in range(0,360,60):
    y,z=27*math.cos(math.radians(a)),27*math.sin(math.radians(a))
    rotor=rotor.cut(cyl(3.5,7,(-51,y,z),(1,0,0)))
add('magneto-rotor','Volant magnétique · rotor','ignition',rotor,'steel',(-245,0,0))
stator=ring(24,12,7,(-44,0,0),(1,0,0))
for a in range(0,360,60):
    sh=box(7,12,12,(-40.5,23,0)).rotate((0,0,0),(1,0,0),a)
    stator=stator.fuse(sh)
    winding=rounded_box(9,11,16,2,(-40.5,23,0)).cut(box(12,6,10,(-40.5,23,0)))
    add(f'stator-coil-{a//60+1}',f'Bobine de stator n°{a//60+1}','ignition',winding.rotate((0,0,0),(1,0,0),a),'copper',(-170,0,0))
add('magneto-stator','Stator · noyau et support','ignition',stator,'dark',(-160,0,0))
cover=cyl(43,29,(-76,0,0),(1,0,0)).cut(cyl(40,28,(-73,0,0),(1,0,0)))
add('magneto-cover','Couvercle d’allumage','ignition',cover,'cast',(-305,0,0))

# Direct output centrifugal clutch, chosen to keep this original design
# independent from a production gearbox. Assembly interfaces are nominal.
hub=ring(22,10.1,8,(42,0,0),(1,0,0))
add('clutch-hub','Embrayage centrifuge · moyeu','clutch',hub,'steel',(170,0,0))
for i,a in enumerate([0,120,240]):
    shoe=ring(35,25,14,(47,0,0),(1,0,0)).intersect(box(25,40,27,(55,20,0)))
    shoe=shoe.rotate((0,0,0),(1,0,0),a)
    add(f'clutch-shoe-{i+1}',f'Masselotte d’embrayage n°{i+1}','clutch',shoe,'steel',(205,0,0))
    lining=ring(37,35.2,13,(47.5,0,0),(1,0,0)).intersect(box(25,40,25,(55,20,0))).rotate((0,0,0),(1,0,0),a)
    add(f'clutch-lining-{i+1}',f'Garniture de friction n°{i+1}','clutch',lining,'gasket',(225,0,0))
    sh=spring(2,.55,2.4,19).rotate((0,0,0),(1,0,0),90).translate((54,9,21)).rotate((0,0,0),(1,0,0),a)
    add(f'clutch-spring-{i+1}',f'Ressort de rappel d’embrayage n°{i+1}','clutch',sh,'steel',(235,0,0))
bell=ring(40,37.7,24,(44,0,0),(1,0,0)).fuse(ring(37.7,10.1,3,(65,0,0),(1,0,0)))
for a in range(0,360,45):bell=bell.cut(cyl(3.5,5,(64,29*math.cos(math.radians(a)),29*math.sin(math.radians(a))),(1,0,0)))
add('clutch-bell','Cloche d’embrayage ventilée','clutch',bell,'steel',(265,0,0))
sprocket=ring(23,10.2,5,(69,0,0),(1,0,0))
for a in range(0,360,30):
    tooth=box(5,8,5,(71.5,23,0)).rotate((0,0,0),(1,0,0),a)
    sprocket=sprocket.fuse(tooth)
add('output-sprocket','Pignon de sortie · 12 dents nominales','gearbox',sprocket,'steel',(300,0,0),'Profil de denture de chaîne à normaliser avant fabrication.')
drivecover=cyl(45,41,(37,0,0),(1,0,0)).cut(cyl(42,38,(36,0,0),(1,0,0))).cut(cyl(12,50,(35,0,0),(1,0,0)))
add('drive-cover','Carter d’embrayage','clutch',drivecover,'cast',(345,0,0))

# Full hollow expansion exhaust: header, diffuser, belly, convergent, stinger,
# muffler housing and perforated baffle. Cone joints represent welded sections.
def tube(ro,ri,length,p,axis):return ring(ro,ri,length,p,axis)
def cone_shell(r1,r2,length,p,axis,thickness=1):
    return cq.Solid.makeCone(r1,r2,length,cq.Vector(*p),cq.Vector(*axis)).cut(
        cq.Solid.makeCone(r1-thickness,r2-thickness,length,cq.Vector(*p),cq.Vector(*axis)))
add('exhaust-header','Collecteur · tube creux Ø26','exhaust',tube(13,12,95,(0,37,88),(0,1,0)),'steel',(0,130,20))
add('exhaust-diffuser','Pot à détente · cône divergent','exhaust',cone_shell(13,48,190,(0,132,88),(0,1,0)),'steel',(0,170,20))
add('exhaust-belly','Pot à détente · ventre','exhaust',tube(48,47,95,(0,322,88),(0,1,0)),'steel',(0,220,20))
add('exhaust-convergent','Pot à détente · contre-cône','exhaust',cone_shell(48,9,140,(0,417,88),(0,1,0)),'steel',(0,270,20))
add('exhaust-stinger','Tube de fuite','exhaust',tube(9,8,110,(0,557,88),(0,1,0)),'steel',(0,310,20))
add('silencer-shell','Silencieux · enveloppe','exhaust',tube(29,27.5,165,(0,630,88),(0,1,0)),'aluminium',(70,355,20))
baffle=tube(10,9,165,(0,630,88),(0,1,0))
for y in range(638,790,12):
    baffle=baffle.cut(cyl(2,30,(-15,y,88),(1,0,0))).cut(cyl(2,30,(0,y,73),(0,0,1)))
add('silencer-baffle','Silencieux · tube perforé','exhaust',baffle,'steel',(-65,355,20))
add('silencer-packing','Silencieux · absorbant annulaire','exhaust',ring(27,10.5,155,(0,635,88),(0,1,0)),'gasket',(120,355,20))
for i,y in enumerate([630,793]):
    add(f'silencer-cap-{i+1}',f'Silencieux · flasque n°{i+1}','exhaust',ring(29,10,2,(0,y,88),(0,1,0)),'aluminium',(0,355+(i*2-1)*35,20))

NOTES='''# 2T Expert E50 — assemblage CAO original, révision 1

## Nature du livrable
Conception numérique originale sans marque, et non reproduction mesurée d'un
moteur commercial. Solides paramétriques CadQuery/OpenCascade exportés en STEP.
Le GLB interactif est tessellé à partir de ces mêmes solides, sans géométrie de
substitution. L'assemblage est une étude de présentation technique.

## Architecture retenue
Monocylindre deux temps, admission à clapets, refroidissement par air,
alésage nominal 40 mm, course 39,8 mm, cylindrée géométrique 50,01 cm³,
bielle 85 mm. Embrayage centrifuge, sortie par pignon : aucune boîte de vitesses.
Position statique à 60 degrés de vilebrequin. L'animation de l'atelier déplace
les composants pour l'inspection ; elle ne simule pas la combustion.

## Détails réellement modélisés
Demi-carters creux, logements de roulements, passages et fixations ; roulements
à billes séparées ; vilebrequin assemblé ; bielle et aiguilles ; piston creux,
gorges, segments ouverts, axe et circlips ; cylindre à ailettes avec chemise,
lumières et canaux ; chambre de culasse, joints et goujons ; éléments de bougie ;
admission et clapets ; carburateur avec boisseau, aiguille, flotteur et gicleur ;
volant et stator ; embrayage et sortie ; échappement creux et silencieux perforé.

## Limites avant fabrication
Pas de validation de fonctionnement, puissance, fiabilité ou conformité.
Les filetages sont nominaux sans hélice. La denture de chaîne, les ajustements,
les cotes de distribution, la carburation, les masses d'équilibrage, le tarage des
ressorts d'embrayage, le système de démarrage, le faisceau d'allumage, les colliers,
la fixation sur un châssis et les soudures ne sont pas un dossier de fabrication.
Les dimensions de l'échappement sont une étude géométrique, pas un calcul de
résonance pour un régime cible. Un motoriste doit revoir cinématique complète,
jeux, dilatation, résistance, lubrification, étanchéité et dissipation thermique.
Ne pas utiliser ce fichier comme instruction de modification d'un véhicule.

## Fichiers
E50-assembly.step : tous les composants nommés et positionnés (millimètres).
parts/*.step : composants indépendants dans les coordonnées d'assemblage.
parts.json : nomenclature numérotée, familles, enveloppes et volumes.
build-engine-cad.py : source paramétrique reproductible (CadQuery 2.7.0).

## Droits
Géométrie et source originales créées pour 2T Expert. Aucun modèle commercial
ni logo tiers n'est utilisé. La source utilise CadQuery sous ses propres licences.
'''

manifest={'name':'2T Expert E50','revision':1,'origin':'original-parametric-design',
          'units':'mm','boreMm':40,'strokeMm':39.8,'rodLengthMm':85,
          'displacementCc':math.pi*40**2*39.8/4000,
          'validation':'Étude CAO originale — non validée pour fabrication',
          'parts':[]}
meshes=[]
with tempfile.TemporaryDirectory(prefix='2t-e50-') as tmp:
    tmp=pathlib.Path(tmp);(tmp/'parts').mkdir()
    print('Exporting named STEP assembly…',flush=True)
    assembly.save(str(tmp/'E50-assembly.step'))
    for i,p in enumerate(parts):
        name=f'{i+1:03d}-{p["id"]}.step'
        cq.exporters.export(p['shape'],str(tmp/'parts'/name))
        item={k:v for k,v in p.items() if k!='shape'}
        item['number']=i+1;item['file']='parts/'+name
        manifest['parts'].append(item)
        verts,faces=p['shape'].tessellate(.18,.12)
        meshes.append({'id':p['id'],'family':p['family'],'material':p['material'],
                       'explode':p['explode'],'positions':[[v.x/1000,v.z/1000,-v.y/1000] for v in verts],
                       'triangles':faces})
    (tmp/'parts.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
    (tmp/'README.md').write_text(NOTES)
    (tmp/'build-engine-cad.py').write_text(pathlib.Path(__file__).read_text())
    with zipfile.ZipFile(OUT/'E50-CAD-original.zip','w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
        for f in tmp.rglob('*'):
            if f.is_file():z.write(f,str(f.relative_to(tmp)))
(OUT/'engine-cad-parts.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(ROOT/'lib/engine-cad-parts.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(OUT/'E50-design-notes.md').write_text(NOTES)
pathlib.Path('/tmp/2t-e50-meshes.json').write_text(json.dumps(meshes))
print(f'Done: {len(parts)} valid CAD components; {manifest["displacementCc"]:.3f} cm³',flush=True)
