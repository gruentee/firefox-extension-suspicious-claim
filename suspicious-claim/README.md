# Prediction-Add-on

So stelle ich mir mein Add-on für die Thesis vor.

## UX

- Als Nutzer möchte ich Text auswählen können, der satzweise klassifziert werden soll
    - dazu
        - **a)** klicke ich einen beliebigen Text an, woraufhin der gesamte zusammenhängende Text ausgewählt wird
        - **b)** markiere ich den gesamten Text, dessen Sätze ich klassifizieren lassen möchte
- Es erscheint ein Button <span style="display: inline-block; border: 1px solid salmon; border-radius: 0.35em; padding: .25em 1em; cursor: pointer; font-variant: common-ligatures all-small-caps; font-weight: bold; letter-spacing: 1px; background: lightblue;">classify!</span>
- Bei Klick auf den Button erscheint ein Warte-Symbol / eine Fortschrittsanzeige
- Nach vollendetem Vorhersageschritt wird jeder Satz des Textes entsprechend seiner Klasse farblich hervorgehoben

### a) vs b)

|     | Pro | Contra |
| --- | --- | --- |
| a)  | \- einfach zu implementieren (?) | \- nur zusammenhängender Text kann ausgewählt werden<br>\- u.U. Schwierigkeiten mit Bildern und Leerstellen? |
| b)  | \- Text muss nicht markiert werden, sondern Add-on wählt gesamten Text des Elternelements<br><br>\- Idee: Tastenkombi \[STRG\] + Klick | \- Implementierung evtl komplizierter?<br><br>\- Nutzer: kann nicht einzelne Sätze auswählen |

## Implementierung - High Level View

So stelle ich mir die Implementierung bisher vor.

### Verarbeitung der Nutzereingabe

1.  **Text auswählen**
    
    - markierten Text auswählen
        \
      *oder*
    - Elternelement per DOM-Traversal identifizieren und enthaltenden Text auswählen
2.  **Bereinigen**
    
    - ~~HTML entfernen~~
    - Bilder entfernen
    - ggf. HTML-Entities (`&...;`) in Klartext umwandeln (?)
3.  **In Sätze aufsplitten**
    
    - wichtig: denselben Algorithmus wie bei Vorverarbeitung im Training verwenden
    - Start- und End-Indizes im Gesamttext merken, damit Markierung möglich
4.  **Übergabe an Tensorflow-Modell**
    
5.  **Fortschrittsanzeige oder Warte-Symbol anzeigen**
    
6.  **Textstellen markieren**
    
    - *Supported*: grünlich
    - *Refuted*: rötlich
    - *NotEnoughInfo*: gelblich
    - wie? `<span style="background-color: …">Satz</span>`
    - **Legende** anzeigen (z.B. in Toolbar-Button): Farbcodes erklären